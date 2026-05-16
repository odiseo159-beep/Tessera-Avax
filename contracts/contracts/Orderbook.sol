// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Orderbook
/// @notice Pull-style escrow orderbook for permissioned SecurityTokens vs USDC.
///         Orders fill atomically (no partial fills). A 0.3% fee on the USDC
///         leg accrues to the contract and can be withdrawn by the owner.
///
/// Conventions
/// - amount is in SecurityToken units (18 decimals)
/// - price is USDC per whole token (6 decimals, same as USDC)
/// - totalUsdc = amount * price / 1e18
contract Orderbook is Ownable {
    using SafeERC20 for IERC20;

    uint256 public constant FEE_BPS = 30;             // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10_000;
    uint256 public constant TOKEN_UNIT = 1e18;

    IERC20 public immutable usdc;
    uint256 public nextOrderId;
    uint256 public feesAccrued;

    struct Order {
        uint256 id;
        address maker;
        address token;
        bool isBuy;
        uint256 amount;
        uint256 price;
        bool active;
    }

    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) public ordersByToken;

    event OrderPlaced(
        uint256 indexed id,
        address indexed maker,
        address indexed token,
        bool isBuy,
        uint256 amount,
        uint256 price
    );
    event OrderFilled(
        uint256 indexed id,
        address indexed taker,
        uint256 amount,
        uint256 totalUsdc,
        uint256 fee
    );
    event OrderCancelled(uint256 indexed id);
    event FeesWithdrawn(address indexed recipient, uint256 amount);

    error InvalidAmount();
    error InvalidPrice();
    error InvalidToken();
    error OrderNotActive();
    error CannotFillOwnOrder();
    error NotOrderMaker();
    error NoFeesToWithdraw();
    error ZeroAddress();

    constructor(address usdc_, address initialOwner) Ownable(initialOwner) {
        if (usdc_ == address(0)) revert ZeroAddress();
        usdc = IERC20(usdc_);
    }

    /// @notice Place a buy or sell order. Escrows USDC (buy) or tokens (sell)
    ///         from the caller; both flows require a prior approve.
    function placeOrder(
        address token,
        bool isBuy,
        uint256 amount,
        uint256 price
    ) external returns (uint256 id) {
        if (amount == 0) revert InvalidAmount();
        if (price == 0) revert InvalidPrice();
        if (token == address(0)) revert InvalidToken();

        id = nextOrderId++;
        orders[id] = Order({
            id: id,
            maker: msg.sender,
            token: token,
            isBuy: isBuy,
            amount: amount,
            price: price,
            active: true
        });
        ordersByToken[token].push(id);

        if (isBuy) {
            usdc.safeTransferFrom(msg.sender, address(this), _totalUsdc(amount, price));
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        emit OrderPlaced(id, msg.sender, token, isBuy, amount, price);
    }

    /// @notice Take the entire amount of an active order. Taker bears the fee
    ///         on the USDC leg.
    function fillOrder(uint256 id) external {
        Order storage order = orders[id];
        if (!order.active) revert OrderNotActive();
        if (order.maker == msg.sender) revert CannotFillOwnOrder();

        order.active = false;

        uint256 totalUsdc = _totalUsdc(order.amount, order.price);
        uint256 fee = (totalUsdc * FEE_BPS) / FEE_DENOMINATOR;
        feesAccrued += fee;

        if (order.isBuy) {
            // Maker pre-escrowed totalUsdc. Taker delivers tokens and receives
            // totalUsdc - fee. The fee stays in the contract.
            IERC20(order.token).safeTransferFrom(msg.sender, order.maker, order.amount);
            usdc.safeTransfer(msg.sender, totalUsdc - fee);
        } else {
            // Maker pre-escrowed tokens. Taker pays totalUsdc + fee and
            // receives the tokens; maker receives totalUsdc clean.
            usdc.safeTransferFrom(msg.sender, address(this), totalUsdc + fee);
            usdc.safeTransfer(order.maker, totalUsdc);
            IERC20(order.token).safeTransfer(msg.sender, order.amount);
        }

        emit OrderFilled(id, msg.sender, order.amount, totalUsdc, fee);
    }

    /// @notice Cancel an active order. Only callable by the original maker.
    function cancelOrder(uint256 id) external {
        Order storage order = orders[id];
        if (!order.active) revert OrderNotActive();
        if (order.maker != msg.sender) revert NotOrderMaker();

        order.active = false;

        if (order.isBuy) {
            usdc.safeTransfer(order.maker, _totalUsdc(order.amount, order.price));
        } else {
            IERC20(order.token).safeTransfer(order.maker, order.amount);
        }

        emit OrderCancelled(id);
    }

    function getOrder(uint256 id) external view returns (Order memory) {
        return orders[id];
    }

    function getOrdersForToken(address token) external view returns (Order[] memory result) {
        uint256[] storage ids = ordersByToken[token];
        result = new Order[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = orders[ids[i]];
        }
    }

    function ordersCountForToken(address token) external view returns (uint256) {
        return ordersByToken[token].length;
    }

    function withdrawFees(address recipient) external onlyOwner {
        if (recipient == address(0)) revert ZeroAddress();
        uint256 amount = feesAccrued;
        if (amount == 0) revert NoFeesToWithdraw();
        feesAccrued = 0;
        usdc.safeTransfer(recipient, amount);
        emit FeesWithdrawn(recipient, amount);
    }

    function _totalUsdc(uint256 amount, uint256 price) internal pure returns (uint256) {
        return (amount * price) / TOKEN_UNIT;
    }
}
