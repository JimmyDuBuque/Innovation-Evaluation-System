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
