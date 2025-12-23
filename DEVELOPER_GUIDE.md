# Developer Guide - FHEVM Example Hub

This guide explains how to develop, test, and extend FHEVM examples in this repository.

## Project Structure

```
.
├── contracts/              # Solidity smart contracts
│   ├── AnonymousInnovationEvaluation.sol  # Main example
│   ├── FHECounter.sol      # Basic example
│   ├── FHEArithmetic.sol   # Operations example
│   ├── AccessControlExample.sol  # Permission patterns
│   └── BlindAuction.sol    # Advanced example
├── test/                   # TypeScript test files
│   └── *.ts               # Test suite for each contract
├── scripts/               # Automation tools
│   ├── create-fhevm-example.ts
│   └── generate-docs.ts
├── deploy/                # Hardhat deployment scripts
│   └── deploy.ts
├── tasks/                 # Custom Hardhat tasks
│   ├── accounts.ts
│   └── deploy-innovation.ts
├── docs/                  # Generated documentation
└── package.json           # Project dependencies
```

## Prerequisites

- Node.js >= 20
- npm >= 7
- Git

## Setup

1. Clone or create the project:
```bash
git clone <repository-url>
cd fhevm-innovation-evaluation-example
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
# Edit .env and add your configuration
```

## Writing a New Example Contract

### 1. Create Contract File

Create a new Solidity file in `contracts/`:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title YourExample
 * @notice Clear description of what this example demonstrates
 * @dev Include key FHEVM concepts explained
 */
contract YourExample is SepoliaConfig {
    // Implementation
}
```

**Key Guidelines:**
- Start with SPDX license identifier
- Import required FHEVM types
- Inherit from `SepoliaConfig` for testnet compatibility
- Document with comprehensive JSDoc comments
- Explain FHEVM patterns used

### 2. Create Test File

Create corresponding test in `test/YourExample.ts`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("YourExample", function () {
  let contract: YourExample;
  let owner: any;

  beforeEach(async function () {
    const [ownerSigner] = await ethers.getSigners();
    owner = ownerSigner;

    const factory = await ethers.getContractFactory("YourExample");
    contract = await factory.deploy();
    await contract.waitForDeployment();
  });

  describe("Functionality", function () {
    it("✅ Should demonstrate key pattern", async function () {
      // Test implementation
    });

    it("❌ Should reject invalid input", async function () {
      // Failure case testing
    });
  });
});
```

**Testing Best Practices:**
- Use ✅ prefix for success cases
- Use ❌ prefix for failure cases
- Include comments explaining FHEVM patterns
- Test both happy path and edge cases
- Demonstrate correct permission management

### 3. Compile and Test

```bash
npm run compile
npm run test
```

### 4. Check Code Quality

```bash
npm run lint
npm run prettier:check
```

## FHEVM Patterns Reference

### ✅ Correct Permission Management

**Always grant both permissions:**

```solidity
euint32 value = FHE.asEuint32(42);
FHE.allowThis(value);        // Contract permission
FHE.allow(value, msg.sender); // User permission
```

### ✅ Homomorphic Operations

**Perform operations on encrypted data:**

```solidity
euint32 sum = FHE.add(value1, value2);      // Addition
euint32 diff = FHE.sub(value1, value2);     // Subtraction
euint32 prod = FHE.mul(value1, value2);     // Multiplication
ebool cond = FHE.eq(value1, value2);        // Equality
```

### ✅ Type Conversions

**Convert between encrypted types safely:**

```solidity
euint8 small = FHE.asEuint8(5);
euint32 large = FHE.asEuint32(small);
```

### ✅ Async Decryption

**Request encrypted value revelation:**

```solidity
function revealResult(euint32 encryptedValue) external onlyOwner {
    bytes32[] memory cts = new bytes32[](1);
    cts[0] = FHE.toBytes32(encryptedValue);
    FHE.requestDecryption(cts, this.callbackFunction.selector);
}

function callbackFunction(uint256 requestId, bytes memory cleartexts, bytes memory decryptionProof) external {
    FHE.checkSignatures(requestId, cleartexts, decryptionProof);
    uint32 value = abi.decode(cleartexts, (uint32));
    // Process decrypted value
}
```

### ❌ Common Pitfalls to Avoid

**1. Forgetting FHE.allowThis():**
```solidity
// ❌ WRONG - Will fail!
euint32 value = FHE.asEuint32(42);
FHE.allow(value, msg.sender);  // Missing allowThis()
```

**2. View functions with encrypted values:**
```solidity
// ❌ WRONG - Cannot return encrypted values from view functions
function getValue() external view returns (euint32) {
    return encryptedValue;
}
```

**3. Using unencrypted operations on encrypted data:**
```solidity
// ❌ WRONG - Cannot do arithmetic directly
euint32 result = encryptedValue + 5;  // Won't compile!
// ✅ CORRECT - Use FHE operations
euint32 result = FHE.add(encryptedValue, FHE.asEuint32(5));
```

## Updating for New Versions

When `@fhevm/solidity` releases a new version:

### 1. Update Dependencies
```bash
npm install @fhevm/solidity@latest
```

### 2. Recompile
```bash
npm run compile
```

### 3. Run Tests
```bash
npm run test
```

### 4. Update Examples Map
Edit `scripts/create-fhevm-example.ts` to add/update examples.

### 5. Regenerate Docs
```bash
npm run generate-all-docs
```

## Automation Scripts

### Creating Standalone Examples

Generate a complete repository for a single example:

```bash
npm run create-example fhe-counter ./my-fhe-counter
cd my-fhe-counter
npm install
npm run test
```

### Generating Documentation

Create GitBook-compatible documentation:

```bash
# Single example
npm run generate-docs fhe-counter

# All examples
npm run generate-all-docs
```

## Testing in Hardhat

### Run All Tests
```bash
npm run test
```

### Run Specific Test File
```bash
npx hardhat test test/AnonymousInnovationEvaluation.ts
```

### Run Tests with Coverage
```bash
npm run coverage
```

### Run Tests on Sepolia (requires .env setup)
```bash
npm run test:sepolia
```

## Deployment

### Local Deployment
```bash
npx hardhat run deploy/deploy.ts
```

### Sepolia Testnet Deployment
```bash
npm run deploy:sepolia
```

### Using Hardhat Deploy
```bash
npm run deploy
```

## Code Quality Standards

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run prettier:write
```

### Type Checking
```bash
npx tsc --noEmit
```

## Documentation

All examples should include:

1. **Solidity Comments**:
   - Function descriptions with `@notice`
   - Implementation notes with `@dev`
   - Parameter documentation

2. **Test Comments**:
   - Clear test descriptions
   - Explanation of what FHEVM pattern is being tested
   - Links to FHEVM docs where applicable

3. **README**:
   - Overview of the concept
   - Key patterns demonstrated
   - Usage instructions
   - Resource links

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM GitHub](https://github.com/zama-ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Security Best Practices](https://docs.openzeppelin.com/contracts/)
- [Solidity Documentation](https://docs.soliditylang.org/)

## Support

For questions or issues:
1. Check existing tests for patterns
2. Review FHEVM documentation
3. Check error messages carefully
4. Ask in Zama Discord community

## License

BSD-3-Clause-Clear - All contributions must use this license.
