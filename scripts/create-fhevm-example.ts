#!/usr/bin/env ts-node

/**
 * create-fhevm-example - CLI tool to generate standalone FHEVM example repositories
 *
 * Usage: ts-node scripts/create-fhevm-example.ts <example-name> [output-dir]
 *
 * Example: ts-node scripts/create-fhevm-example.ts innovation-evaluation ./my-innovation-example
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Color codes for terminal output
enum Color {
  Reset = '\x1b[0m',
  Green = '\x1b[32m',
  Blue = '\x1b[34m',
  Yellow = '\x1b[33m',
  Red = '\x1b[31m',
  Cyan = '\x1b[36m',
}

function log(message: string, color: Color = Color.Reset): void {
  console.log(`${color}${message}${Color.Reset}`);
}

function error(message: string): never {
  log(`❌ Error: ${message}`, Color.Red);
  process.exit(1);
}

function success(message: string): void {
  log(`✅ ${message}`, Color.Green);
}

function info(message: string): void {
  log(`ℹ️  ${message}`, Color.Blue);
}

// Example configuration interface
interface ExampleConfig {
  contract: string;
  test: string;
  description: string;
  category: string;
}

// Map of example names to their contract and test paths
const EXAMPLES_MAP: Record<string, ExampleConfig> = {
  'fhe-counter': {
    contract: 'contracts/FHECounter.sol',
    test: 'test/FHECounter.ts',
    description: 'Simple FHE counter demonstrating basic encrypted arithmetic and permission management',
    category: 'basic',
  },
  'fhe-arithmetic': {
    contract: 'contracts/FHEArithmetic.sol',
    test: 'test/FHEArithmetic.ts',
    description: 'Arithmetic operations on encrypted values (add, sub, mul, min, max)',
    category: 'basic',
  },
  'access-control': {
    contract: 'contracts/AccessControlExample.sol',
    test: 'test/AccessControlExample.ts',
    description: 'Access control patterns with FHE.allow and FHE.allowThis permission management',
    category: 'intermediate',
  },
  'blind-auction': {
    contract: 'contracts/BlindAuction.sol',
    test: 'test/BlindAuction.ts',
    description: 'Advanced sealed-bid auction using encrypted bids and comparison operations',
    category: 'advanced',
  },
  'innovation-evaluation': {
    contract: 'contracts/AnonymousInnovationEvaluation.sol',
    test: 'test/AnonymousInnovationEvaluation.ts',
    description: 'Privacy-preserving innovation evaluation system with multi-dimensional encrypted scoring',
    category: 'advanced',
  },
};

function copyDirectoryRecursive(source: string, destination: string): void {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const items = fs.readdirSync(source);

  items.forEach(item => {
    const sourcePath = path.join(source, item);
    const destPath = path.join(destination, item);
    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      // Skip node_modules, artifacts, cache, etc.
      if (['node_modules', 'artifacts', 'cache', 'coverage', 'types', 'dist'].includes(item)) {
        return;
      }
      copyDirectoryRecursive(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

function getContractName(contractPath: string): string | null {
  const content = fs.readFileSync(contractPath, 'utf-8');
  // Match contract declaration, ignoring comments and ensuring it's followed by 'is' or '{'
  const match = content.match(/^\s*contract\s+(\w+)(?:\s+is\s+|\s*\{)/m);
  return match ? match[1] : null;
}

function updateDeployScript(outputDir: string, contractName: string): void {
  const deployScriptPath = path.join(outputDir, 'deploy', 'deploy.ts');

  const deployScript = `import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployed = await deploy("${contractName}", {
    from: deployer,
    args: [],
    log: true,
  });

  console.log(\`${contractName} contract deployed at: \${deployed.address}\`);
};

export default func;
func.id = "${contractName.toLowerCase()}_deploy";
func.tags = ["${contractName}"];
`;

  fs.writeFileSync(deployScriptPath, deployScript);
}

function generateREADME(
  outputDir: string,
  exampleName: string,
  contractName: string,
  description: string
): void {
  const readme = `# ${contractName} - FHEVM Example

${description}

## Overview

This example demonstrates the use of Fully Homomorphic Encryption (FHE) in a smart contract for ${exampleName}. It showcases key FHEVM concepts including:

- **Encrypted Data Types**: Using \`euint8\`, \`euint32\`, and \`ebool\` for privacy-preserving computations
- **Access Control**: Proper use of \`FHE.allowThis()\` and \`FHE.allow()\` for permission management
- **Homomorphic Operations**: Performing calculations on encrypted values using \`FHE.add()\`, \`FHE.sub()\`, etc.
- **Async Decryption**: Utilizing Zama's decryption callback pattern for revealing results

## Prerequisites

- Node.js >= 20
- npm or yarn

## Installation

\`\`\`bash
npm install
\`\`\`

## Configuration

1. Copy the example environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

2. Update \`.env\` with your configuration:
- Add your private key for deployment
- Configure RPC endpoints if needed

## Usage

### Compile Contracts

\`\`\`bash
npm run compile
\`\`\`

### Run Tests

\`\`\`bash
npm run test
\`\`\`

### Deploy to Sepolia Testnet

\`\`\`bash
npm run deploy:contracts
\`\`\`

## Contract Structure

The \`${contractName}\` contract demonstrates:

1. **Data Encryption**: Values are encrypted before being stored on-chain
2. **Privacy Preservation**: Individual data remains confidential throughout operations
3. **Secure Computation**: Homomorphic operations allow computation on encrypted data
4. **Controlled Decryption**: Only authorized parties can decrypt specific values

## Key FHEVM Patterns

### ✅ Correct Permission Management

\`\`\`solidity
euint32 value = FHE.asEuint32(42);
FHE.allowThis(value);        // Contract permission
FHE.allow(value, msg.sender); // User permission
\`\`\`

### ✅ Homomorphic Addition

\`\`\`solidity
euint32 sum = FHE.add(encryptedValue1, encryptedValue2);
\`\`\`

### ✅ Async Decryption Pattern

\`\`\`solidity
bytes32[] memory cts = new bytes32[](1);
cts[0] = FHE.toBytes32(encryptedValue);
FHE.requestDecryption(cts, this.callbackFunction.selector);
\`\`\`

## Testing Patterns

The test suite demonstrates:
- Proper FHEVM test setup using \`@fhevm/hardhat-plugin\`
- Creating encrypted inputs with correct bindings
- Testing both success and failure scenarios
- Verifying access control enforcement

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama GitHub](https://github.com/zama-ai)
- [FHEVM Hardhat Template](https://github.com/zama-ai/fhevm-hardhat-template)

## License

BSD-3-Clause-Clear

---

Built with ❤️ using [FHEVM](https://github.com/zama-ai/fhevm) by Zama
`;

  fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    log('📚 FHEVM Example Generator', Color.Cyan);
    log('');
    log('Usage: ts-node scripts/create-fhevm-example.ts <example-name> [output-dir]', Color.Blue);
    log('');
    log('Available Examples:', Color.Green);
    Object.entries(EXAMPLES_MAP).forEach(([name, config]) => {
      log(`  ${name}`, Color.Yellow);
      log(`    ${config.description}`, Color.Reset);
    });
    log('');
    log('Example:', Color.Cyan);
    log('  ts-node scripts/create-fhevm-example.ts innovation-evaluation ./my-example', Color.Blue);
    process.exit(0);
  }

  const exampleName = args[0];
  const outputDir = args[1] || `./${exampleName}`;

  const config = EXAMPLES_MAP[exampleName];
  if (!config) {
    error(`Unknown example: ${exampleName}. Run with --help to see available examples.`);
  }

  info(`Creating FHEVM example: ${exampleName}`);
  info(`Output directory: ${outputDir}`);

  // Get project root
  const projectRoot = path.resolve(__dirname, '..');

  // Paths
  const templateDir = path.join(projectRoot, 'fhevm-hardhat-template');
  const contractPath = path.join(projectRoot, config.contract);
  const testPath = path.join(projectRoot, config.test);

  // Verify paths exist
  if (!fs.existsSync(templateDir)) {
    error(`Template directory not found: ${templateDir}`);
  }
  if (!fs.existsSync(contractPath)) {
    error(`Contract not found: ${contractPath}`);
  }
  if (!fs.existsSync(testPath)) {
    error(`Test file not found: ${testPath}`);
  }

  // Create output directory
  if (fs.existsSync(outputDir)) {
    error(`Output directory already exists: ${outputDir}`);
  }

  info('Copying base template...');
  copyDirectoryRecursive(templateDir, outputDir);
  success('Base template copied');

  // Get contract name
  const contractName = getContractName(contractPath);
  if (!contractName) {
    error(`Could not extract contract name from: ${contractPath}`);
  }

  // Copy contract
  info(`Copying contract: ${contractName}`);
  const targetContractPath = path.join(outputDir, 'contracts', `${contractName}.sol`);
  fs.copyFileSync(contractPath, targetContractPath);
  success(`Contract copied to contracts/${contractName}.sol`);

  // Copy test
  info('Copying test file...');
  const targetTestPath = path.join(outputDir, 'test', path.basename(testPath));
  fs.copyFileSync(testPath, targetTestPath);
  success(`Test copied to test/${path.basename(testPath)}`);

  // Update deploy script
  info('Generating deployment script...');
  updateDeployScript(outputDir, contractName);
  success('Deployment script generated');

  // Generate README
  info('Generating README...');
  generateREADME(outputDir, exampleName, contractName, config.description);
  success('README generated');

  // Summary
  log('');
  success(`✨ Example repository created successfully at: ${outputDir}`);
  log('');
  log('Next steps:', Color.Cyan);
  log(`  1. cd ${outputDir}`, Color.Blue);
  log('  2. npm install', Color.Blue);
  log('  3. npm run compile', Color.Blue);
  log('  4. npm run test', Color.Blue);
  log('');
}

main();
