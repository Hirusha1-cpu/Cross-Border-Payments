// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Bridge is Ownable, ReentrancyGuard {
    // ↑ Ownable + ReentrancyGuard උරුම කරගෙන

    uint256 public transactionCounter;
    // ↑ ගනුදෙනු ගණන් කරන counter එක

    struct BridgeTransaction {
        uint256 id;
        address sender;
        uint256 amount;
        uint256 timestamp;
        bool processed;
        string targetChain;
    }
    // ↑ Bridge data structure එක
    //   targetChain: "ARBITRUM", "OPTIMISM"

    mapping(uint256 => BridgeTransaction) public transactions;
    // ↑ bridgeId → BridgeTransaction

    event BridgeCreated(uint256 indexed id, address sender, uint256 amount, string targetChain);
    event BridgeProcessed(uint256 indexed id, string targetChain);

    function createBridge(uint256 amount, string memory targetChain) 
        external 
        nonReentrant 
        returns (uint256) 
    {
        // ↑ Bridge request එකක් create කරන function එක

        require(amount > 0, "Amount must be > 0");
        require(bytes(targetChain).length > 0, "Invalid target chain");
        // ↑ Validation

        transactionCounter++;
        // ↑ ගනුදෙනු ගණන 1ක් වැඩි කරනවා

        transactions[transactionCounter] = BridgeTransaction({
            id: transactionCounter,
            sender: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            processed: false,
            targetChain: targetChain
        });
        // ↑ Bridge data එක save කරනවා

        emit BridgeCreated(transactionCounter, msg.sender, amount, targetChain);
        // ↑ Event එක emit කරනවා

        return transactionCounter;
        // ↑ bridge ID එක return කරනවා
    }

    function processBridge(uint256 bridgeId) external onlyOwner {
        // ↑ Bridge එක process කරන function එක
        //   onlyOwner = admin පමණක් call කළ හැකියි

        BridgeTransaction storage tx = transactions[bridgeId];
        // ↑ bridge data එක load කරනවා

        require(!tx.processed, "Already processed");
        // ↑ දැනටමත් processed නොවිය යුතුයි

        tx.processed = true;
        // ↑ processed කියලා mark කරනවා

        emit BridgeProcessed(bridgeId, tx.targetChain);
        // ↑ Event එක emit කරනවා
    }
}