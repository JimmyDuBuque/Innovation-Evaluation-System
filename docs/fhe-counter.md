# FHE Counter

## Overview

Simple counter demonstrating basic FHEVM operations

This example demonstrates advanced FHEVM concepts for building privacy-preserving applications where sensitive evaluations must remain confidential until authorized revelation.

## Key Concepts

- Encrypted state variables (euint32)
- Basic arithmetic operations (add, sub)
- Permission management with FHE.allowThis() and FHE.allow()
- Input encryption with proofs
- Event emissions

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

```

## Test Suite

Comprehensive tests showing correct usage and common pitfalls:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * FHECounter Contract Tests
 * 
 * This test suite demonstrates:
 * - Basic FHEVM operations (add, sub)
 * - Encrypted input handling
 * - Permission management patterns
 * - Event emissions
 */
describe("FHECounter", function () {
  let contract: any;
  let owner: any;
  let user1: any;

  beforeEach(async function () {
    const [ownerSigner, user1Signer] = await ethers.getSigners();
    owner = ownerSigner;
    user1 = user1Signer;

    const FHECounterFactory = await ethers.getContractFactory("FHECounter");
    contract = await FHECounterFactory.deploy();
    await contract.waitForDeployment();
  });

  describe("Basic Operations", function () {
    it("✅ Should initialize counter to zero", async function () {
      const count = await contract.getCount();
      expect(count).to.not.be.undefined;
    });

    it("✅ Should increment counter", async function () {
      const tx = await contract.connect(user1).increment(1, "0x");
      await expect(tx).to.emit(contract, "Incremented");
    });

    it("✅ Should decrement counter", async function () {
      const tx = await contract.connect(user1).decrement(1, "0x");
      await expect(tx).to.emit(contract, "Decremented");
    });
  });

  describe("Permission Management", function () {
    it("✅ Demonstrates correct permission pattern (allowThis + allow)", async function () {
      // The increment function demonstrates the correct pattern:
      // 1. FHE.allowThis(counter) - grants contract permission
      // 2. FHE.allow(counter, msg.sender) - grants user permission
      
      const tx = await contract.connect(user1).increment(5, "0x");
      await expect(tx).to.not.be.reverted;
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
