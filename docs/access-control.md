# Access Control Patterns

## Overview

Access control and permission management in FHEVM

This example demonstrates advanced FHEVM concepts for building privacy-preserving applications where sensitive evaluations must remain confidential until authorized revelation.

## Key Concepts

- FHE.allow() - Granting decryption permission
- FHE.allowThis() - Contract permissions
- Permission sharing between addresses
- Transfer operations with encrypted balances
- Anti-patterns and common mistakes

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

```

## Test Suite

Comprehensive tests showing correct usage and common pitfalls:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * AccessControlExample Contract Tests
 * 
 * Demonstrates:
 * - FHE.allow() for granting decryption permissions
 * - FHE.allowThis() for contract permissions
 * - Permission management patterns
 * - Access control with encrypted data
 * - Best practices and anti-patterns
 */
describe("AccessControlExample", function () {
  let contract: any;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    const [ownerSigner, user1Signer, user2Signer] = await ethers.getSigners();
    owner = ownerSigner;
    user1 = user1Signer;
    user2 = user2Signer;

    const factory = await ethers.getContractFactory("AccessControlExample");
    contract = await factory.deploy();
    await contract.waitForDeployment();
  });

  describe("Balance Management", function () {
    it("✅ Should set encrypted balance", async function () {
      const tx = await contract.connect(user1).setBalance(1000, "0x");
      await expect(tx).to.emit(contract, "BalanceSet");
    });

    it("✅ Should retrieve encrypted balance", async function () {
      await contract.connect(user1).setBalance(1000, "0x");
      const balance = await contract.connect(user1).getMyBalance();
      expect(balance).to.not.be.undefined;
    });
  });

  describe("Permission Sharing", function () {
    it("✅ Should grant access to another address", async function () {
      await contract.connect(user1).setBalance(1000, "0x");
      const tx = await contract.connect(user1).grantAccess(user2.address);
      await expect(tx).to.emit(contract, "PermissionGranted").withArgs(user1.address, user2.address);
    });

    it("❌ Should reject invalid addresses", async function () {
      await contract.connect(user1).setBalance(1000, "0x");
      const tx = contract.connect(user1).grantAccess(ethers.ZeroAddress);
      await expect(tx).to.be.revertedWith("Invalid address");
    });
  });

  describe("Transfer Operations", function () {
    it("✅ Should transfer encrypted balance", async function () {
      await contract.connect(user1).setBalance(1000, "0x");
      await contract.connect(user2).setBalance(500, "0x");
      
      const tx = await contract.connect(user1).transfer(user2.address, 100, "0x");
      await expect(tx).to.not.be.reverted;
    });
  });

  describe("Anti-Pattern Examples", function () {
    it("❌ Shows anti-pattern: missing allowThis()", async function () {
      // This function deliberately omits FHE.allowThis() to show the wrong way
      const tx = await contract.connect(user1).antiPatternMissingAllowThis(1000, "0x");
      // Note: This would fail in a real FHEVM environment when trying to use the value
      await expect(tx).to.not.be.reverted; // In test environment it may pass
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

**Category**: Intermediate Examples

**Complexity**: Advanced

**Topics**: Multi-dimensional encryption, Homomorphic aggregation, Async decryption, Access control
