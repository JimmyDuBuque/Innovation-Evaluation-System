# Quick Start Guide

Get the FHEVM Example Hub up and running in minutes!

## Prerequisites

- **Node.js** >= 20 (check with `node --version`)
- **npm** >= 7 (check with `npm --version`)
- **Git** (for version control)

## Installation (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Hardhat and plugins
- FHEVM solidity library
- Testing framework (Chai, Mocha)
- TypeScript tools
- Linting and formatting tools

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` to add your configuration:
```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=your_rpc_url_here
```

## Basic Commands

### Compile Contracts

```bash
npm run compile
```

Compiles all Solidity contracts in `contracts/` to `artifacts/`.

### Run Tests

```bash
npm run test
```

Executes all test files in `test/` directory. Shows:
- Number of passing/failing tests
- Test execution time
- Gas usage (if enabled)

### Check Code Quality

```bash
npm run lint
npm run prettier:check
npm run prettier:write  # Auto-format code
```

## Working with Examples

### Generate Standalone Example Repository

Create a complete, self-contained example repository:

```bash
# Generate example
npm run create-example fhe-counter ./my-fhe-counter

# Navigate to generated repo
cd my-fhe-counter
npm install
npm run compile
npm run test
```

**Available Examples**:
- `fhe-counter` - Simple encrypted counter
- `fhe-arithmetic` - Arithmetic operations on encrypted data
- `access-control` - Permission management patterns
- `blind-auction` - Advanced sealed-bid auction
- `innovation-evaluation` - Multi-dimensional privacy-preserving evaluation

### Generate Documentation

Create GitBook-compatible markdown documentation:

```bash
# Single example documentation
npm run generate-docs fhe-counter

# All examples documentation
npm run generate-all-docs
```

Documentation appears in `docs/` directory.

## Project Structure

```
fhevm-innovation-evaluation-example/
├── contracts/                  # Solidity smart contracts
│   ├── AnonymousInnovationEvaluation.sol
│   ├── FHECounter.sol
│   ├── FHEArithmetic.sol
│   ├── AccessControlExample.sol
│   └── BlindAuction.sol
│
├── test/                       # TypeScript tests
│   ├── AnonymousInnovationEvaluation.ts
│   ├── FHECounter.ts
│   ├── FHEArithmetic.ts
│   ├── AccessControlExample.ts
│   └── BlindAuction.ts
│
├── scripts/                    # Automation tools
│   ├── create-fhevm-example.ts
│   └── generate-docs.ts
│
├── deploy/                     # Hardhat deployment scripts
│   └── deploy.ts
│
├── tasks/                      # Custom Hardhat tasks
│   ├── accounts.ts
│   └── deploy-innovation.ts
│
├── docs/                       # Generated documentation
│
├── hardhat.config.ts          # Hardhat configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # Main documentation
```

## Deployment

### Local Deployment (Hardhat Network)

```bash
npx hardhat run deploy/deploy.ts
```

### Deploy to Sepolia Testnet

1. Ensure `.env` has `PRIVATE_KEY` and `SEPOLIA_RPC_URL`
2. Get testnet ETH from faucet
3. Deploy:

```bash
npm run deploy:sepolia
```

## Understanding Examples

### FHE Counter (`contracts/FHECounter.sol`)

**What it demonstrates**:
- Encrypted state variables (`euint32`)
- Homomorphic arithmetic (`FHE.add`, `FHE.sub`)
- Permission management (`FHE.allowThis`, `FHE.allow`)

**Use case**: Simple encrypted counter for learning basic FHEVM

### Innovation Evaluation (`contracts/AnonymousInnovationEvaluation.sol`)

**What it demonstrates**:
- Multi-dimensional encrypted data
- Homomorphic aggregation
- Complex permission management
- Async decryption callbacks

**Use case**: Real-world privacy-preserving evaluation system

## Key FHEVM Concepts

### Encrypted Types

```solidity
euint8  - 8-bit encrypted unsigned integer
euint32 - 32-bit encrypted unsigned integer
euint64 - 64-bit encrypted unsigned integer
ebool   - Encrypted boolean
```

### Critical Permissions Pattern

**Always grant BOTH permissions:**

```solidity
euint32 value = FHE.asEuint32(42);
FHE.allowThis(value);        // Contract can use this value
FHE.allow(value, msg.sender); // User can decrypt this value
```

### Homomorphic Operations

```solidity
FHE.add(a, b)      // Addition
FHE.sub(a, b)      // Subtraction
FHE.mul(a, b)      // Multiplication
FHE.min(a, b)      // Minimum
FHE.max(a, b)      // Maximum
FHE.eq(a, b)       // Equality comparison
```

## Troubleshooting

### "Cannot find module '@fhevm/solidity'"

```bash
npm install
npm run compile
```

### Tests Failing

Check that:
1. All dependencies installed: `npm install`
2. Contracts compiled: `npm run compile`
3. No syntax errors: `npm run lint`

### Deployment Issues

- Verify `.env` file exists and is configured
- Check you have enough gas for deployment
- Ensure `PRIVATE_KEY` is valid
- Verify RPC URL is accessible

## Next Steps

1. **Read the examples** - Check `contracts/` to understand patterns
2. **Run the tests** - `npm run test` to see patterns in action
3. **Create your own** - Write a new contract in `contracts/`
4. **Generate standalone repo** - `npm run create-example your-example ./output`
5. **Review documentation** - Check `DEVELOPER_GUIDE.md` for detailed patterns

## Resources

- 📚 [FHEVM Documentation](https://docs.zama.ai/fhevm)
- 🔗 [FHEVM GitHub](https://github.com/zama-ai/fhevm)
- 🛠️ [Hardhat Documentation](https://hardhat.org/)
- 💬 [Zama Discord Community](https://discord.com/invite/zama)

## Getting Help

If you run into issues:

1. Check `DEVELOPER_GUIDE.md` for detailed explanations
2. Review existing test files for patterns
3. Check FHEVM documentation for API details
4. Ask in Zama community Discord

## Support

- Open an issue for bugs
- Submit PRs with improvements
- Share your FHEVM examples
- Contribute to documentation

---

**Happy coding with FHEVM!** 🎉
