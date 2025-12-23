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
