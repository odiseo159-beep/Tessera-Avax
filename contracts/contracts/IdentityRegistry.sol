// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title IdentityRegistry
/// @notice On-chain KYC registry. The claim issuer attests that a wallet has
///         passed KYC and records the user's country. SecurityToken transfers
///         check this registry to enforce compliance at the token level.
contract IdentityRegistry is Ownable {
    mapping(address => bool) public verified;
    mapping(address => string) public country;
    address public claimIssuer;

    event IdentityAdded(address indexed account, string country);
    event IdentityRemoved(address indexed account);
    event ClaimIssuerChanged(address indexed previousIssuer, address indexed newIssuer);

    error NotClaimIssuer();
    error AlreadyVerified();
    error NotVerifiedYet();
    error ZeroAddress();

    modifier onlyClaimIssuer() {
        if (msg.sender != claimIssuer) revert NotClaimIssuer();
        _;
    }

    constructor(address initialClaimIssuer) Ownable(msg.sender) {
        if (initialClaimIssuer == address(0)) revert ZeroAddress();
        claimIssuer = initialClaimIssuer;
        emit ClaimIssuerChanged(address(0), initialClaimIssuer);
    }

    function addIdentity(address account, string calldata countryCode) external onlyClaimIssuer {
        if (account == address(0)) revert ZeroAddress();
        if (verified[account]) revert AlreadyVerified();
        verified[account] = true;
        country[account] = countryCode;
        emit IdentityAdded(account, countryCode);
    }

    function removeIdentity(address account) external onlyClaimIssuer {
        if (!verified[account]) revert NotVerifiedYet();
        delete verified[account];
        delete country[account];
        emit IdentityRemoved(account);
    }

    function isVerified(address account) external view returns (bool) {
        return verified[account];
    }

    function setClaimIssuer(address newIssuer) external onlyOwner {
        if (newIssuer == address(0)) revert ZeroAddress();
        address previous = claimIssuer;
        claimIssuer = newIssuer;
        emit ClaimIssuerChanged(previous, newIssuer);
    }
}
