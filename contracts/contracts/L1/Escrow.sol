// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Escrow is Ownable, ReentrancyGuard {
    IERC20 public usdc;
    uint256 public transactionCounter;
    uint256 public constant FEE = 10; // 0.1%
    address public feeRecipient;

    struct EscrowTx {
        uint256 id;
        address sender;
        address receiver;
        uint256 amount;        // net amount (after fee) - what's in contract
        uint256 grossAmount;   // original amount (before fee)
        uint256 timestamp;
        bool released;
        bool refunded;
    }

    mapping(uint256 => EscrowTx) public transactions;
    mapping(address => uint256[]) public userTransactions;

    event EscrowCreated(uint256 indexed id, address sender, address receiver, uint256 amount);
    event EscrowReleased(uint256 indexed id, address receiver, uint256 amount);
    event EscrowRefunded(uint256 indexed id, address sender, uint256 amount);

    constructor(address _usdc, address _feeRecipient) {
        usdc = IERC20(_usdc);
        feeRecipient = _feeRecipient;
    }

    function createEscrow(address receiver, uint256 amount) external nonReentrant returns (uint256) {
        require(receiver != address(0), "Invalid receiver");
        require(amount > 0, "Amount must be > 0");
        require(usdc.balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(usdc.allowance(msg.sender, address(this)) >= amount, "Approve USDC");

        uint256 fee = (amount * FEE) / 10000;
        uint256 netAmount = amount - fee;

        usdc.transferFrom(msg.sender, address(this), amount);

        transactionCounter++;
        transactions[transactionCounter] = EscrowTx({
            id: transactionCounter,
            sender: msg.sender,
            receiver: receiver,
            amount: netAmount,
            grossAmount: amount,
            timestamp: block.timestamp,
            released: false,
            refunded: false
        });

        userTransactions[msg.sender].push(transactionCounter);
        userTransactions[receiver].push(transactionCounter);

        if (fee > 0) {
            usdc.transfer(feeRecipient, fee);
        }

        emit EscrowCreated(transactionCounter, msg.sender, receiver, netAmount);
        return transactionCounter;
    }

    function releaseFunds(uint256 escrowId) external nonReentrant {
        EscrowTx storage escrow = transactions[escrowId];
        
        require(msg.sender == escrow.sender || msg.sender == escrow.receiver, "Not authorized");
        require(!escrow.released && !escrow.refunded, "Already processed");

        escrow.released = true;
        usdc.transfer(escrow.receiver, escrow.amount);

        emit EscrowReleased(escrowId, escrow.receiver, escrow.amount);
    }

    function refundFunds(uint256 escrowId) external nonReentrant {
        EscrowTx storage escrow = transactions[escrowId];
        
        require(escrow.sender == msg.sender, "Only sender");
        require(!escrow.released && !escrow.refunded, "Already processed");
        require(block.timestamp >= escrow.timestamp + 7 days, "Too early");

        escrow.refunded = true;
        
        // ✅ FIX: Refund netAmount (what's actually in contract)
        // Contract only has netAmount because fee was sent to feeRecipient
        uint256 refundAmount = escrow.amount; // NOT grossAmount!
        
        uint256 contractBalance = usdc.balanceOf(address(this));
        require(contractBalance >= refundAmount, "Insufficient contract balance");
        
        usdc.transfer(escrow.sender, refundAmount);

        emit EscrowRefunded(escrowId, escrow.sender, refundAmount);
    }

    function getEscrow(uint256 escrowId) external view returns (EscrowTx memory) {
        return transactions[escrowId];
    }
}