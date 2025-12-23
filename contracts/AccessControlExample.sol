// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, inEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title AccessControlExample
 * @notice Demonstrates proper access control patterns in FHEVM
 * @dev This example showcases:
 *   - FHE.allow() - Granting decryption permission to specific addresses
 *   - FHE.allowThis() - Granting contract permission to use encrypted values
 *   - FHE.allowTransient() - Temporary permissions
 *   - Input proof validation
 *   - Permission management best practices
 */
contract AccessControlExample is SepoliaConfig {
    mapping(address => euint32) private userBalances;
    address public owner;

    event BalanceSet(address indexed user);
    event PermissionGranted(address indexed user, address indexed grantee);

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Sets encrypted balance for the caller
     * @dev Demonstrates:
     *   - Input proof validation
     *   - FHE.allowThis() for contract permission
     *   - FHE.allow() for user permission
     *
     * CRITICAL PATTERN:
     * Always call both FHE.allowThis() AND FHE.allow() after creating
     * or modifying encrypted values. Missing either will cause failures.
     */
    function setBalance(inEuint32 encryptedAmount, bytes calldata inputProof) external {
        euint32 amount = FHE.asEuint32(encryptedAmount, inputProof);
        userBalances[msg.sender] = amount;

        // Grant contract permission - REQUIRED
        FHE.allowThis(userBalances[msg.sender]);
        
        // Grant user permission to decrypt their own balance
        FHE.allow(userBalances[msg.sender], msg.sender);

        emit BalanceSet(msg.sender);
    }

    /**
     * @notice Grant another address permission to decrypt your balance
     * @dev Demonstrates how to share encrypted data with other addresses
     * @param grantee Address to grant permission to
     */
    function grantAccess(address grantee) external {
        require(grantee != address(0), "Invalid address");
        
        // Grant permission to another address
        FHE.allow(userBalances[msg.sender], grantee);
        
        emit PermissionGranted(msg.sender, grantee);
    }

    /**
     * @notice Get encrypted balance for the caller
     * @dev Only returns meaningful data if caller has permission
     * @return Encrypted balance value
     */
    function getMyBalance() external view returns (euint32) {
        return userBalances[msg.sender];
    }

    /**
     * @notice Get encrypted balance for any address
     * @dev Only returns meaningful data if caller has permission
     * @param user Address to query
     * @return Encrypted balance value
     */
    function getBalance(address user) external view returns (euint32) {
        return userBalances[user];
    }

    /**
     * @notice Transfer encrypted amount to another user
     * @dev Demonstrates:
     *   - Operations on encrypted values
     *   - Updating multiple encrypted state variables
     *   - Permission management after operations
     */
    function transfer(address to, inEuint32 encryptedAmount, bytes calldata inputProof) external {
        require(to != address(0), "Invalid recipient");
        
        euint32 amount = FHE.asEuint32(encryptedAmount, inputProof);
        
        // Subtract from sender
        userBalances[msg.sender] = FHE.sub(userBalances[msg.sender], amount);
        
        // Add to recipient
        userBalances[to] = FHE.add(userBalances[to], amount);
        
        // Update permissions for both addresses
        FHE.allowThis(userBalances[msg.sender]);
        FHE.allow(userBalances[msg.sender], msg.sender);
        
        FHE.allowThis(userBalances[to]);
        FHE.allow(userBalances[to], to);
    }

    /**
     * @notice Example of ANTI-PATTERN - Missing allowThis()
     * @dev This function demonstrates what NOT to do
     */
    function antiPatternMissingAllowThis(inEuint32 encryptedAmount, bytes calldata inputProof) external {
        euint32 amount = FHE.asEuint32(encryptedAmount, inputProof);
        userBalances[msg.sender] = amount;

        // ❌ WRONG: Only granting user permission, missing contract permission
        // This will cause failures when the contract tries to use the value
        FHE.allow(userBalances[msg.sender], msg.sender);
        // Missing: FHE.allowThis(userBalances[msg.sender]);
    }
}
