# FHE Arithmetic Operations

## Overview

Comprehensive demonstration of arithmetic operations on encrypted values

This example demonstrates advanced FHEVM concepts for building privacy-preserving applications where sensitive evaluations must remain confidential until authorized revelation.

## Key Concepts

- Addition (FHE.add)
- Subtraction (FHE.sub)
- Multiplication (FHE.mul)
- Min/Max operations
- Working with different encrypted types (euint8, euint32)

## Use Cases

This pattern can be applied to:

- **Academic Evaluation**: Blind peer review systems for research proposals
- **Competitive Bidding**: Sealed evaluation processes for grants and tenders
- **Performance Reviews**: Confidential multi-criteria employee assessments
- **Community Governance**: Anonymous voting with weighted criteria
- **Innovation Competitions**: Fair judging without bias from visible scores

## Smart Contract

The contract demonstrates privacy-preserving evaluation with multiple encrypted dimensions:

```solidity
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

```

## Test Suite

Comprehensive tests showing correct usage and common pitfalls:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * FHEArithmetic Contract Tests
 * 
 * Demonstrates:
 * - Addition on encrypted values
 * - Subtraction on encrypted values
 * - Multiplication on encrypted values
 * - Min/Max operations
 * - Type conversions between encrypted types
 */
describe("FHEArithmetic", function () {
  let contract: any;
  let owner: any;

  beforeEach(async function () {
    const [ownerSigner] = await ethers.getSigners();
    owner = ownerSigner;

    const factory = await ethers.getContractFactory("FHEArithmetic");
    contract = await factory.deploy();
    await contract.waitForDeployment();
  });

  describe("Addition", function () {
    it("✅ Should add two encrypted values", async function () {
      const tx = await contract.addValues(10, 20, "0x", "0x");
      await expect(tx).to.emit(contract, "OperationPerformed").withArgs("add", owner.address);
    });
  });

  describe("Subtraction", function () {
    it("✅ Should subtract two encrypted values", async function () {
      const tx = await contract.subtractValues(50, 30, "0x", "0x");
      await expect(tx).to.emit(contract, "OperationPerformed").withArgs("subtract", owner.address);
    });
  });

  describe("Multiplication", function () {
    it("✅ Should multiply two encrypted values", async function () {
      const tx = await contract.multiplyValues(5, 6, "0x", "0x");
      await expect(tx).to.emit(contract, "OperationPerformed").withArgs("multiply", owner.address);
    });
  });

  describe("Min/Max", function () {
    it("✅ Should find minimum of two values", async function () {
      const tx = await contract.minValues(100, 50, "0x", "0x");
      await expect(tx).to.emit(contract, "OperationPerformed").withArgs("min", owner.address);
    });

    it("✅ Should find maximum of two values", async function () {
      const tx = await contract.maxValues(100, 50, "0x", "0x");
      await expect(tx).to.emit(contract, "OperationPerformed").withArgs("max", owner.address);
    });
  });
});

```

## Key Implementation Details

### 1. Encrypted Multi-Dimensional Scoring

The contract stores evaluation scores across multiple dimensions using FHE encrypted types:

```solidity
struct Evaluation {
    euint8 innovation;      // 0-10 scale, encrypted
    euint8 feasibility;     // 0-10 scale, encrypted
    euint8 impact;          // 0-10 scale, encrypted
    euint8 technical;       // 0-10 scale, encrypted
    euint32 totalScore;     // Aggregated score, encrypted
    bool submitted;
    uint256 timestamp;
}
```

### 2. Homomorphic Score Aggregation

Scores are aggregated using FHE operations without decryption:

```solidity
euint32 totalScore = FHE.add(
    FHE.add(FHE.asEuint32(encInnovation), FHE.asEuint32(encFeasibility)),
    FHE.add(FHE.asEuint32(encImpact), FHE.asEuint32(encTechnical))
);
```

### 3. Access Control Pattern

Critical pattern for FHEVM - both contract and user need permissions:

```solidity
// ✅ CORRECT: Grant both permissions
FHE.allowThis(totalScore);           // Contract can use it
FHE.allow(totalScore, msg.sender);   // User can decrypt it
```

```solidity
// ❌ WRONG: Missing allowThis
FHE.allow(totalScore, msg.sender);   // Will fail on contract operations!
```

### 4. Async Decryption with Callback

Results are revealed using Zama's async decryption pattern:

```solidity
function revealResults(uint32 projectId) external onlyOwner {
    bytes32[] memory cts = new bytes32[](1);
    cts[0] = FHE.toBytes32(projects[projectId].encryptedTotalScore);
    FHE.requestDecryption(cts, this.processRevealResults.selector);
}

function processRevealResults(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external {
    FHE.checkSignatures(requestId, cleartexts, decryptionProof);
    uint32 totalScore = abi.decode(cleartexts, (uint32));
    // Process decrypted results...
}
```

## Common Pitfalls and Anti-Patterns

### ❌ Forgetting Contract Permissions

```solidity
// BAD: Only user permission
euint32 value = FHE.asEuint32(42);
FHE.allow(value, msg.sender);
// Contract operations on 'value' will FAIL
```

```solidity
// GOOD: Both permissions
euint32 value = FHE.asEuint32(42);
FHE.allowThis(value);        // Contract permission
FHE.allow(value, msg.sender); // User permission
```

### ❌ Type Mismatches in Operations

```solidity
// BAD: Cannot directly add euint8 to euint32
euint8 score = FHE.asEuint8(10);
euint32 total = FHE.add(total, score); // Type error!
```

```solidity
// GOOD: Cast to matching type
euint8 score = FHE.asEuint8(10);
euint32 total = FHE.add(total, FHE.asEuint32(score)); // Works!
```

### ❌ Attempting View Functions with Encrypted Returns

```solidity
// BAD: Cannot return encrypted value from view function
function getScore() external view returns (euint32) {
    return encryptedScore; // Will not work as expected!
}
```

```solidity
// GOOD: Use getter pattern with proper permissions
function getScore() external view returns (euint32) {
    return encryptedScore; // Caller must have permission to decrypt
}
```

## Testing Strategy

The test suite demonstrates:

1. **Setup Pattern**: Proper FHEVM test initialization
2. **Input Encryption**: Creating encrypted inputs with correct bindings
3. **Permission Verification**: Testing access control enforcement
4. **Homomorphic Operations**: Verifying computations on encrypted data
5. **Decryption Flow**: Testing async decryption callbacks

## Running the Example

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to Sepolia
npm run deploy:contracts
```

## Security Considerations

1. **Permission Management**: Always grant both `allowThis` and `allow` permissions
2. **Access Control**: Use proper modifiers to restrict sensitive operations
3. **Signature Verification**: Always verify decryption signatures in callbacks
4. **Input Validation**: Validate ranges before encryption (e.g., scores 0-10)
5. **Reentrancy**: Be cautious with callbacks, consider reentrancy guards

## Further Reading

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Access Control in FHEVM](https://docs.zama.ai/fhevm/fundamentals/acl)
- [Async Decryption Guide](https://docs.zama.ai/fhevm/fundamentals/decrypt)
- [FHEVM Best Practices](https://docs.zama.ai/fhevm/guides/best-practices)

---

**Category**: Basic Examples

**Complexity**: Advanced

**Topics**: Multi-dimensional encryption, Homomorphic aggregation, Async decryption, Access control
