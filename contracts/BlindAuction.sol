// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, inEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title BlindAuction
 * @notice Advanced example demonstrating a sealed-bid auction using FHEVM
 * @dev This example showcases:
 *   - Private bidding where bids remain encrypted
 *   - Comparison operations on encrypted values
 *   - State management with encrypted data
 *   - Async decryption for revealing winners
 *   - Time-based auction phases
 */
contract BlindAuction is SepoliaConfig {
    struct Bid {
        euint32 amount;
        bool exists;
    }

    address public owner;
    address public seller;
    uint256 public auctionEndTime;
    bool public auctionEnded;
    
    mapping(address => Bid) public bids;
    euint32 public highestBid;
    address public highestBidder;
    uint32 public revealedHighestBid;
    bool public resultRevealed;

    event BidPlaced(address indexed bidder);
    event AuctionEnded();
    event WinnerRevealed(address indexed winner, uint32 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier auctionActive() {
        require(block.timestamp < auctionEndTime, "Auction ended");
        require(!auctionEnded, "Auction closed");
        _;
    }

    /**
     * @notice Creates a new blind auction
     * @param _seller Address of the seller
     * @param _duration Duration of the auction in seconds
     */
    constructor(address _seller, uint256 _duration) {
        owner = msg.sender;
        seller = _seller;
        auctionEndTime = block.timestamp + _duration;
        auctionEnded = false;
        resultRevealed = false;
        
        // Initialize highest bid to zero
        highestBid = FHE.asEuint32(0);
        FHE.allowThis(highestBid);
    }

    /**
     * @notice Place an encrypted bid
     * @dev Bids are kept encrypted until auction ends
     * @param encryptedBidAmount Encrypted bid amount
     * @param inputProof Proof for the encrypted input
     */
    function placeBid(inEuint32 encryptedBidAmount, bytes calldata inputProof) external auctionActive {
        require(!bids[msg.sender].exists, "Already bid");

        euint32 bidAmount = FHE.asEuint32(encryptedBidAmount, inputProof);

        // Store the encrypted bid
        bids[msg.sender] = Bid({
            amount: bidAmount,
            exists: true
        });

        // Grant permissions
        FHE.allowThis(bidAmount);
        FHE.allow(bidAmount, msg.sender);

        // Compare with current highest bid using encrypted comparison
        ebool isHigher = FHE.gt(bidAmount, highestBid);
        
        // Update highest bid if this bid is higher
        // Note: FHE.select(condition, valueIfTrue, valueIfFalse)
        euint32 newHighestBid = FHE.select(isHigher, bidAmount, highestBid);
        
        // Update highest bidder conditionally
        // In a real implementation, we'd need a more sophisticated way to update the address
        // This is a simplified version
        bool isHigherPlain = block.timestamp % 2 == 0; // Placeholder for actual comparison
        if (FHE.decrypt(isHigher)) { // This would be done via callback in production
            highestBid = newHighestBid;
            highestBidder = msg.sender;
            FHE.allowThis(highestBid);
        }

        emit BidPlaced(msg.sender);
    }

    /**
     * @notice End the auction (owner only)
     */
    function endAuction() external onlyOwner {
        require(block.timestamp >= auctionEndTime, "Auction still active");
        require(!auctionEnded, "Already ended");

        auctionEnded = true;
        emit AuctionEnded();
    }

    /**
     * @notice Request decryption of the winning bid
     * @dev Uses async decryption pattern
     */
    function revealWinner() external onlyOwner {
        require(auctionEnded, "Auction not ended");
        require(!resultRevealed, "Already revealed");

        // Request decryption of highest bid
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(highestBid);
        FHE.requestDecryption(cts, this.processRevealWinner.selector);
    }

    /**
     * @notice Callback for decryption result
     * @dev This is called by the FHEVM system after decryption
     */
    function processRevealWinner(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify signatures
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        // Decode the decrypted highest bid
        uint32 highestBidAmount = abi.decode(cleartexts, (uint32));

        revealedHighestBid = highestBidAmount;
        resultRevealed = true;

        emit WinnerRevealed(highestBidder, highestBidAmount);
    }

    /**
     * @notice Get encrypted bid for a bidder
     * @param bidder Address of the bidder
     * @return Encrypted bid amount
     */
    function getBid(address bidder) external view returns (euint32) {
        require(bids[bidder].exists, "No bid from this address");
        return bids[bidder].amount;
    }

    /**
     * @notice Check if address has placed a bid
     */
    function hasBid(address bidder) external view returns (bool) {
        return bids[bidder].exists;
    }

    /**
     * @notice Get auction status
     */
    function getAuctionStatus() external view returns (
        uint256 endTime,
        bool ended,
        bool revealed,
        address winner,
        uint32 winningBid
    ) {
        return (
            auctionEndTime,
            auctionEnded,
            resultRevealed,
            resultRevealed ? highestBidder : address(0),
            resultRevealed ? revealedHighestBid : 0
        );
    }
}
