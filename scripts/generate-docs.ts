#!/usr/bin/env ts-node

/**
 * generate-docs - Generates GitBook-compatible documentation from FHEVM examples
 *
 * Usage: ts-node scripts/generate-docs.ts [example-name] [--all]
 *
 * Example: ts-node scripts/generate-docs.ts innovation-evaluation
 * Example: ts-node scripts/generate-docs.ts --all
 */

import * as fs from 'fs';
import * as path from 'path';

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

interface ExampleConfig {
  name: string;
  title: string;
  description: string;
  category: string;
  contractPath: string;
  testPath: string;
  concepts: string[];
}

const EXAMPLES_CONFIG: ExampleConfig[] = [
  {
    name: 'innovation-evaluation',
    title: 'Anonymous Innovation Evaluation',
    description: 'Privacy-preserving innovation evaluation system with encrypted multi-dimensional scoring',
    category: 'Advanced Examples',
    contractPath: 'contracts/AnonymousInnovationEvaluation.sol',
    testPath: 'test/AnonymousInnovationEvaluation.ts',
    concepts: [
      'Encrypted data structures',
      'Multi-dimensional scoring',
      'Access control with FHE.allowThis() and FHE.allow()',
      'Homomorphic addition for aggregation',
      'Async decryption with callbacks',
      'Ranking calculation',
    ],
  },
];

function extractCodeBlock(filePath: string, language: string): string {
  if (!fs.existsSync(filePath)) {
    return `// File not found: ${filePath}`;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return `\`\`\`${language}\n${content}\n\`\`\``;
}

function generateExampleDoc(config: ExampleConfig, projectRoot: string): string {
  const contractPath = path.join(projectRoot, config.contractPath);
  const testPath = path.join(projectRoot, config.testPath);

  const doc = `# ${config.title}

## Overview

${config.description}

This example demonstrates advanced FHEVM concepts for building privacy-preserving applications where sensitive evaluations must remain confidential until authorized revelation.

## Key Concepts

${config.concepts.map(concept => `- ${concept}`).join('\n')}

## Use Cases

This pattern can be applied to:

- **Academic Evaluation**: Blind peer review systems for research proposals
- **Competitive Bidding**: Sealed evaluation processes for grants and tenders
- **Performance Reviews**: Confidential multi-criteria employee assessments
- **Community Governance**: Anonymous voting with weighted criteria
- **Innovation Competitions**: Fair judging without bias from visible scores

## Smart Contract

The contract demonstrates privacy-preserving evaluation with multiple encrypted dimensions:

${extractCodeBlock(contractPath, 'solidity')}

## Test Suite

Comprehensive tests showing correct usage and common pitfalls:

${extractCodeBlock(testPath, 'typescript')}

## Key Implementation Details

### 1. Encrypted Multi-Dimensional Scoring

The contract stores evaluation scores across multiple dimensions using FHE encrypted types:

\`\`\`solidity
struct Evaluation {
    euint8 innovation;      // 0-10 scale, encrypted
    euint8 feasibility;     // 0-10 scale, encrypted
    euint8 impact;          // 0-10 scale, encrypted
    euint8 technical;       // 0-10 scale, encrypted
    euint32 totalScore;     // Aggregated score, encrypted
    bool submitted;
    uint256 timestamp;
}
\`\`\`

### 2. Homomorphic Score Aggregation

Scores are aggregated using FHE operations without decryption:

\`\`\`solidity
euint32 totalScore = FHE.add(
    FHE.add(FHE.asEuint32(encInnovation), FHE.asEuint32(encFeasibility)),
    FHE.add(FHE.asEuint32(encImpact), FHE.asEuint32(encTechnical))
);
\`\`\`

### 3. Access Control Pattern

Critical pattern for FHEVM - both contract and user need permissions:

\`\`\`solidity
// ✅ CORRECT: Grant both permissions
FHE.allowThis(totalScore);           // Contract can use it
FHE.allow(totalScore, msg.sender);   // User can decrypt it
\`\`\`

\`\`\`solidity
// ❌ WRONG: Missing allowThis
FHE.allow(totalScore, msg.sender);   // Will fail on contract operations!
\`\`\`

### 4. Async Decryption with Callback

Results are revealed using Zama's async decryption pattern:

\`\`\`solidity
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
\`\`\`

## Common Pitfalls and Anti-Patterns

### ❌ Forgetting Contract Permissions

\`\`\`solidity
// BAD: Only user permission
euint32 value = FHE.asEuint32(42);
FHE.allow(value, msg.sender);
// Contract operations on 'value' will FAIL
\`\`\`

\`\`\`solidity
// GOOD: Both permissions
euint32 value = FHE.asEuint32(42);
FHE.allowThis(value);        // Contract permission
FHE.allow(value, msg.sender); // User permission
\`\`\`

### ❌ Type Mismatches in Operations

\`\`\`solidity
// BAD: Cannot directly add euint8 to euint32
euint8 score = FHE.asEuint8(10);
euint32 total = FHE.add(total, score); // Type error!
\`\`\`

\`\`\`solidity
// GOOD: Cast to matching type
euint8 score = FHE.asEuint8(10);
euint32 total = FHE.add(total, FHE.asEuint32(score)); // Works!
\`\`\`

### ❌ Attempting View Functions with Encrypted Returns

\`\`\`solidity
// BAD: Cannot return encrypted value from view function
function getScore() external view returns (euint32) {
    return encryptedScore; // Will not work as expected!
}
\`\`\`

\`\`\`solidity
// GOOD: Use getter pattern with proper permissions
function getScore() external view returns (euint32) {
    return encryptedScore; // Caller must have permission to decrypt
}
\`\`\`

## Testing Strategy

The test suite demonstrates:

1. **Setup Pattern**: Proper FHEVM test initialization
2. **Input Encryption**: Creating encrypted inputs with correct bindings
3. **Permission Verification**: Testing access control enforcement
4. **Homomorphic Operations**: Verifying computations on encrypted data
5. **Decryption Flow**: Testing async decryption callbacks

## Running the Example

\`\`\`bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to Sepolia
npm run deploy:contracts
\`\`\`

## Security Considerations

1. **Permission Management**: Always grant both \`allowThis\` and \`allow\` permissions
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

**Category**: ${config.category}

**Complexity**: Advanced

**Topics**: Multi-dimensional encryption, Homomorphic aggregation, Async decryption, Access control
`;

  return doc;
}

function generateSummary(configs: ExampleConfig[]): string {
  const summary = `# Summary

## Introduction

* [Overview](README.md)

## Advanced Examples

${configs.map(config => `* [${config.title}](${config.name}.md)`).join('\n')}

## Resources

* [FHEVM Documentation](https://docs.zama.ai/fhevm)
* [Zama GitHub](https://github.com/zama-ai)
* [FHEVM Hardhat Template](https://github.com/zama-ai/fhevm-hardhat-template)
`;

  return summary;
}

function generateOverviewREADME(): string {
  return `# FHEVM Examples - Documentation

Welcome to the FHEVM Examples documentation! This collection demonstrates privacy-preserving smart contract patterns using Fully Homomorphic Encryption.

## About FHEVM

FHEVM (Fully Homomorphic Encryption Virtual Machine) enables smart contracts to perform computations on encrypted data without decryption. This preserves privacy while maintaining the transparency and security of blockchain.

## What You'll Learn

These examples demonstrate:

- **Encrypted Data Types**: Working with \`euint8\`, \`euint32\`, \`ebool\`
- **Homomorphic Operations**: Computing on encrypted values
- **Access Control**: Managing permissions with \`FHE.allowThis()\` and \`FHE.allow()\`
- **Async Decryption**: Secure result revelation with callbacks
- **Real-World Patterns**: Practical privacy-preserving applications

## Example Categories

### Advanced Examples

Advanced patterns demonstrating complex FHEVM applications with multiple encrypted dimensions, aggregation, and ranking systems.

## Getting Started

Each example includes:
- Complete Solidity smart contract
- Comprehensive test suite
- Detailed explanations of key concepts
- Common pitfalls and anti-patterns
- Security considerations

## Resources

- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **GitHub**: https://github.com/zama-ai
- **Community**: https://discord.gg/zama

---

Built with ❤️ using FHEVM by Zama
`;
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    log('📚 FHEVM Documentation Generator', Color.Cyan);
    log('');
    log('Usage: ts-node scripts/generate-docs.ts [example-name] [--all]', Color.Blue);
    log('');
    log('Options:', Color.Green);
    log('  --all    Generate documentation for all examples', Color.Yellow);
    log('  --help   Show this help message', Color.Yellow);
    log('');
    log('Available Examples:', Color.Green);
    EXAMPLES_CONFIG.forEach(config => {
      log(`  ${config.name}`, Color.Yellow);
      log(`    ${config.description}`, Color.Reset);
    });
    log('');
    log('Examples:', Color.Cyan);
    log('  ts-node scripts/generate-docs.ts innovation-evaluation', Color.Blue);
    log('  ts-node scripts/generate-docs.ts --all', Color.Blue);
    process.exit(0);
  }

  const projectRoot = path.resolve(__dirname, '..');
  const docsDir = path.join(projectRoot, 'docs');

  // Create docs directory if it doesn't exist
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const generateAll = args.includes('--all');
  const exampleName = !generateAll && args.length > 0 ? args[0] : null;

  let configsToGenerate: ExampleConfig[] = [];

  if (generateAll) {
    info('Generating documentation for all examples...');
    configsToGenerate = EXAMPLES_CONFIG;
  } else if (exampleName) {
    const config = EXAMPLES_CONFIG.find(c => c.name === exampleName);
    if (!config) {
      error(`Unknown example: ${exampleName}. Run with --help to see available examples.`);
    }
    info(`Generating documentation for: ${exampleName}`);
    configsToGenerate = [config];
  } else {
    error('Please specify an example name or use --all flag');
  }

  // Generate documentation for each example
  configsToGenerate.forEach(config => {
    info(`Processing: ${config.title}`);
    const doc = generateExampleDoc(config, projectRoot);
    const docPath = path.join(docsDir, `${config.name}.md`);
    fs.writeFileSync(docPath, doc);
    success(`Generated: ${config.name}.md`);
  });

  // Generate SUMMARY.md
  info('Generating SUMMARY.md...');
  const summary = generateSummary(EXAMPLES_CONFIG);
  fs.writeFileSync(path.join(docsDir, 'SUMMARY.md'), summary);
  success('Generated: SUMMARY.md');

  // Generate README.md for docs
  info('Generating documentation README...');
  const overviewReadme = generateOverviewREADME();
  fs.writeFileSync(path.join(docsDir, 'README.md'), overviewReadme);
  success('Generated: README.md');

  log('');
  success(`✨ Documentation generated successfully in: ${docsDir}`);
  log('');
  log('Generated files:', Color.Cyan);
  configsToGenerate.forEach(config => {
    log(`  - ${config.name}.md`, Color.Blue);
  });
  log('  - SUMMARY.md', Color.Blue);
  log('  - README.md', Color.Blue);
  log('');
}

main();
