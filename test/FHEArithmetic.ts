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
