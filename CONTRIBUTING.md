# Contributing to FHEVM Example Hub

Thank you for your interest in contributing! This document outlines the process for contributing examples, improvements, and fixes.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion:

1. Check if the issue already exists
2. Provide clear description of the problem
3. Include steps to reproduce
4. Share your environment (Node version, OS)
5. Expected vs actual behavior

### Adding New Examples

We welcome new FHEVM examples! Here's the process:

1. **Create a new branch**:
   ```bash
   git checkout -b feature/new-example-name
   ```

2. **Write the contract** in `contracts/`:
   - Include comprehensive comments
   - Document FHEVM patterns used
   - Show both correct usage and anti-patterns
   - Use clear variable names

3. **Write tests** in `test/`:
   - Test success cases (✅)
   - Test failure cases (❌)
   - Cover all functions
   - Verify permission management

4. **Update scripts**:
   - Add to `EXAMPLES_MAP` in `scripts/create-fhevm-example.ts`
   - Add to example configuration in `scripts/generate-docs.ts`

5. **Generate documentation**:
   ```bash
   npm run generate-docs your-example-name
   ```

6. **Verify everything works**:
   ```bash
   npm run compile
   npm run test
   npm run lint
   ```

7. **Create standalone example**:
   ```bash
   npm run create-example your-example-name ./test-output
   cd test-output
   npm install && npm run test
   ```

8. **Submit pull request** with:
   - Clear description of the example
   - What FHEVM concepts it demonstrates
   - Tests passing locally
   - Code following the style guide

### Improving Existing Examples

To enhance current examples:

1. **Identify improvement area**:
   - Clearer comments
   - Better test coverage
   - Optimized implementation
   - Additional patterns

2. **Make changes**:
   - Keep original functionality intact
   - Improve documentation
   - Add tests for new patterns

3. **Test thoroughly**:
   ```bash
   npm run test
   npm run lint
   ```

4. **Update documentation** if needed

5. **Submit pull request**

### Fixing Bugs

If you find and fix a bug:

1. Create a test that reproduces the bug
2. Fix the bug
3. Verify the test passes
4. Ensure no other tests break
5. Submit pull request with bug details

## Development Workflow

### Before You Start

```bash
npm install
npm run compile
npm run test
```

### Make Your Changes

1. Create feature branch
2. Make changes following code style
3. Add/update tests
4. Run quality checks

### Quality Checks

```bash
npm run lint           # Check code style
npm run prettier:check # Check formatting
npm run test           # Run test suite
npm run coverage       # Check test coverage
```

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add new FHEVM example for state machine
fix: correct permission management in counter
docs: improve FHEVM pattern documentation
test: add edge case tests for decryption
refactor: simplify type conversion logic
```

## Style Guide

### Solidity

- Use `pragma solidity ^0.8.24;`
- Import from `@fhevm/solidity`
- Inherit from `SepoliaConfig` for testnet examples
- Use explicit visibility modifiers
- Document all public/external functions
- Use events for important state changes

```solidity
// ✅ Good
contract Example is SepoliaConfig {
    euint32 private value;

    /**
     * @notice Updates encrypted value
     * @param newValue The new encrypted value
     * @dev Always call FHE.allowThis() after modifications
     */
    function setValue(euint32 newValue) external {
        value = newValue;
        FHE.allowThis(value);
    }
}
```

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow eslint configuration
- Use Prettier for formatting
- Clear, descriptive variable names
- Comment complex logic

```typescript
// ✅ Good
describe("MyExample", function () {
  let contract: MyExample;

  beforeEach(async function () {
    const factory = await ethers.getContractFactory("MyExample");
    contract = await factory.deploy();
  });

  it("✅ should demonstrate pattern correctly", async function () {
    const result = await contract.myFunction();
    expect(result).to.equal(expectedValue);
  });
});
```

### Comments

Use clear comments explaining FHEVM concepts:

```solidity
// CORRECT: Explains the FHE pattern
euint32 value = FHE.asEuint32(42);
FHE.allowThis(value);        // Grant contract permission
FHE.allow(value, msg.sender); // Grant user permission
```

## Testing Requirements

All contributions must include:

1. **Unit tests** for all functions
2. **Integration tests** demonstrating use cases
3. **Failure cases** showing error handling
4. **FHEVM pattern validation** tests
5. **Minimum 80% code coverage**

## Documentation Requirements

Every example needs:

1. **JSDoc comments** in contract code
2. **Test explanations** showing patterns
3. **README.md** describing the example
4. **Usage examples** in documentation
5. **Links to FHEVM resources**

## Pull Request Process

1. **Fork and create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "descriptive message"
   ```

3. **Keep updated with main**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature
   ```

5. **Create Pull Request** with:
   - Clear title
   - Detailed description
   - Links to related issues
   - Screenshots/examples if applicable
   - Test results showing all passing

6. **Respond to review feedback**
   - Make requested changes
   - Explain any disagreements respectfully
   - Update PR as needed

7. **Merge once approved**

## Review Criteria

PRs are reviewed for:

- **Correctness**: Code works as intended
- **Quality**: Follows style guide and best practices
- **Testing**: Comprehensive test coverage
- **Documentation**: Clear and helpful docs
- **Performance**: Efficient implementation
- **Security**: No vulnerabilities introduced
- **FHEVM Patterns**: Correct encryption/permission usage

## Getting Help

- Ask questions in PR comments
- Check existing examples for patterns
- Review FHEVM documentation
- Reach out on Zama Discord
- Open discussion issues for design questions

## Recognition

All contributors are:
- Listed in CONTRIBUTORS.md
- Credited in commit history
- Acknowledged in releases

Thank you for contributing!
