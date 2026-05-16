// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IdentityRegistry} from "./IdentityRegistry.sol";

/// @title SecurityToken
/// @notice ERC-3643 style permissioned ERC20. Every transfer between two real
///         addresses requires the recipient to be in IdentityRegistry and the
///         lockup period to be over. Mint (from == 0) and burn (to == 0) bypass
///         the checks so the issuer can seed supply and burn freely.
contract SecurityToken is ERC20, Ownable {
    IdentityRegistry public immutable identityRegistry;
    uint256 public immutable lockupEnd;

    string public companyName;
    string public sector;
    string public vintageRound;

    error RecipientNotVerified();
    error LockupActive();

    constructor(
        string memory name_,
        string memory symbol_,
        address identityRegistry_,
        uint256 lockupEnd_,
        uint256 totalSupply_,
        string memory companyName_,
        string memory sector_,
        string memory vintageRound_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        identityRegistry = IdentityRegistry(identityRegistry_);
        lockupEnd = lockupEnd_;
        companyName = companyName_;
        sector = sector_;
        vintageRound = vintageRound_;
        _mint(msg.sender, totalSupply_);
    }

    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0) && to != address(0)) {
            if (!identityRegistry.isVerified(to)) revert RecipientNotVerified();
            if (block.timestamp < lockupEnd) revert LockupActive();
        }
        super._update(from, to, value);
    }
}
