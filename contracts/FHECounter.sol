// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, inEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title FHECounter
 * @notice A simple counter demonstrating basic FHEVM operations
 * @dev This example showcases:
 *   - Encrypted state variables (euint32)
 *   - Homomorphic arithmetic (add, sub)
 *   - Proper permission management (FHE.allowThis, FHE.allow)
 *   - Input encryption with proofs
 */
contract FHECounter is SepoliaConfig {
    euint32 private _count;
    address public owner;

    event Incremented(address indexed user);
    event Decremented(address indexed user);

    constructor() {
        owner = msg.sender;
        _count = FHE.asEuint32(0);
        FHE.allowThis(_count);
    }

    /**
     * @notice Returns the encrypted counter value
     * @return The encrypted count that can be decrypted by authorized addresses
     */
    function getCount() external view returns (euint32) {
        return _count;
    }

    /**
     * @notice Increments counter by an encrypted value
     * @param inputEuint32 Encrypted input value (handle)
     * @param inputProof Proof validating the encrypted input
     * @dev Demonstrates:
     *   1. Converting external encrypted input: FHE.asEuint32()
     *   2. Homomorphic addition: FHE.add()
     *   3. Permission management: FHE.allowThis() + FHE.allow()
     */
    function increment(inEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 value = FHE.asEuint32(inputEuint32, inputProof);
        _count = FHE.add(_count, value);

        // CRITICAL: Always grant both permissions
        FHE.allowThis(_count);        // Contract permission
        FHE.allow(_count, msg.sender); // User permission

        emit Incremented(msg.sender);
    }

    /**
     * @notice Decrements counter by an encrypted value
     * @param inputEuint32 Encrypted input value
     * @param inputProof Proof validating the encrypted input
     * @dev Note: Underflow checks omitted for simplicity
     */
    function decrement(inEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 value = FHE.asEuint32(inputEuint32, inputProof);
        _count = FHE.sub(_count, value);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);

        emit Decremented(msg.sender);
    }
}
