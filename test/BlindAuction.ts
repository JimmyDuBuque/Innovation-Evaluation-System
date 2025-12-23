import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

/**
 * BlindAuction Contract Tests
 * 
 * Demonstrates:
 * - Sealed-bid auction pattern
 * - Encrypted bid management
 * - Time-based auction phases
 * - Comparison operations on encrypted values
 * - Async decryption pattern
 */
describe("BlindAuction", function () {
  let contract: any;
  let owner: any;
  let seller: any;
  let bidder1: any;
  let bidder2: any;
  const auctionDuration = 3600; // 1 hour

  beforeEach(async function () {
    const [ownerSigner, sellerSigner, bidder1Signer, bidder2Signer] = await ethers.getSigners();
    owner = ownerSigner;
    seller = sellerSigner;
    bidder1 = bidder1Signer;
    bidder2 = bidder2Signer;

    const factory = await ethers.getContractFactory("BlindAuction");
    contract = await factory.deploy(seller.address, auctionDuration);
    await contract.waitForDeployment();
  });

  describe("Bid Placement", function () {
    it("✅ Should allow valid bids during auction", async function () {
      const tx = await contract.connect(bidder1).placeBid(1000, "0x");
      await expect(tx).to.emit(contract, "BidPlaced");
    });

    it("❌ Should reject duplicate bids from same bidder", async function () {
      await contract.connect(bidder1).placeBid(1000, "0x");
      const tx = contract.connect(bidder1).placeBid(2000, "0x");
      await expect(tx).to.be.revertedWith("Already bid");
    });

    it("❌ Should reject bids after auction ends", async function () {
      // Fast forward past auction end
      await time.increase(auctionDuration + 1);
      
      const tx = contract.connect(bidder1).placeBid(1000, "0x");
      await expect(tx).to.be.revertedWith("Auction ended");
    });
  });

  describe("Auction Management", function () {
    it("✅ Should allow owner to end auction", async function () {
      await time.increase(auctionDuration + 1);
      const tx = await contract.connect(owner).endAuction();
      await expect(tx).to.emit(contract, "AuctionEnded");
    });

    it("❌ Should not allow ending auction before duration", async function () {
      const tx = contract.connect(owner).endAuction();
      await expect(tx).to.be.revertedWith("Auction still active");
    });
  });

  describe("Status Queries", function () {
    it("✅ Should return auction status", async function () {
      await contract.connect(bidder1).placeBid(1000, "0x");
      
      const status = await contract.getAuctionStatus();
      expect(status.ended).to.be.false;
      expect(status.revealed).to.be.false;
    });

    it("✅ Should confirm bid existence", async function () {
      await contract.connect(bidder1).placeBid(1000, "0x");
      
      const hasBid = await contract.hasBid(bidder1.address);
      expect(hasBid).to.be.true;
    });
  });
});
