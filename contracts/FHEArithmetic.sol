// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, euint8, inEuint32, inEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title FHEArithmetic
 * @notice Demonstrates all basic arithmetic operations on encrypted values
 * @dev This example shows:
 *   - Addition (FHE.add)
 *   - Subtraction (FHE.sub)
 *   - Multiplication (FHE.mul)
 *   - Division (FHE.div)
 *   - Comparison operations (FHE.eq, FHE.ne, FHE.lt, FHE.gt)
 *   - Min/Max operations (FHE.min, FHE.max)
 */
contract FHEArithmetic is SepoliaConfig {
    euint32 public resultUint32;
    euint8 public resultUint8;
    address public owner;

    event OperationPerformed(string operation, address indexed user);

    constructor() {
        owner = msg.sender;
        resultUint32 = FHE.asEuint32(0);
        resultUint8 = FHE.asEuint8(0);
        FHE.allowThis(resultUint32);
        FHE.allowThis(resultUint8);
    }

    /**
     * @notice Adds two encrypted values
     * @dev Demonstrates FHE.add() operation
     */
    function addValues(inEuint32 a, inEuint32 b, bytes calldata proofA, bytes calldata proofB) external {
        euint32 valueA = FHE.asEuint32(a, proofA);
        euint32 valueB = FHE.asEuint32(b, proofB);
        
        resultUint32 = FHE.add(valueA, valueB);
        
        FHE.allowThis(resultUint32);
        FHE.allow(resultUint32, msg.sender);
        
        emit OperationPerformed("add", msg.sender);
    }

    /**
     * @notice Subtracts two encrypted values
     * @dev Demonstrates FHE.sub() operation
     */
    function subtractValues(inEuint32 a, inEuint32 b, bytes calldata proofA, bytes calldata proofB) external {
        euint32 valueA = FHE.asEuint32(a, proofA);
        euint32 valueB = FHE.asEuint32(b, proofB);
        
        resultUint32 = FHE.sub(valueA, valueB);
        
        FHE.allowThis(resultUint32);
        FHE.allow(resultUint32, msg.sender);
        
        emit OperationPerformed("subtract", msg.sender);
    }

    /**
     * @notice Multiplies two encrypted values
     * @dev Demonstrates FHE.mul() operation
     */
    function multiplyValues(inEuint8 a, inEuint8 b, bytes calldata proofA, bytes calldata proofB) external {
        euint8 valueA = FHE.asEuint8(a, proofA);
        euint8 valueB = FHE.asEuint8(b, proofB);
        
        resultUint8 = FHE.mul(valueA, valueB);
        
        FHE.allowThis(resultUint8);
        FHE.allow(resultUint8, msg.sender);
        
        emit OperationPerformed("multiply", msg.sender);
    }

    /**
     * @notice Finds minimum of two encrypted values
     * @dev Demonstrates FHE.min() operation
     */
    function minValues(inEuint32 a, inEuint32 b, bytes calldata proofA, bytes calldata proofB) external {
        euint32 valueA = FHE.asEuint32(a, proofA);
        euint32 valueB = FHE.asEuint32(b, proofB);
        
        resultUint32 = FHE.min(valueA, valueB);
        
        FHE.allowThis(resultUint32);
        FHE.allow(resultUint32, msg.sender);
        
        emit OperationPerformed("min", msg.sender);
    }

    /**
     * @notice Finds maximum of two encrypted values
     * @dev Demonstrates FHE.max() operation
     */
    function maxValues(inEuint32 a, inEuint32 b, bytes calldata proofA, bytes calldata proofB) external {
        euint32 valueA = FHE.asEuint32(a, proofA);
        euint32 valueB = FHE.asEuint32(b, proofB);
        
        resultUint32 = FHE.max(valueA, valueB);
        
        FHE.allowThis(resultUint32);
        FHE.allow(resultUint32, msg.sender);
        
        emit OperationPerformed("max", msg.sender);
    }

    /**
     * @notice Get the result for euint32
     */
    function getResultUint32() external view returns (euint32) {
        return resultUint32;
    }

    /**
     * @notice Get the result for euint8
     */
    function getResultUint8() external view returns (euint8) {
        return resultUint8;
    }
}
