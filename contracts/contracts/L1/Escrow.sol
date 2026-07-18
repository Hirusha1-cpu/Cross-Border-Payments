// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
// ↑ Solidity version 0.8.20 භාවිතා කරනවා

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// ↑ OpenZeppelin libraries import කරනවා
//   IERC20 - USDC token එකට connect වෙන්න
//   Ownable - contract එකේ හිමිකරු (admin) set කරන්න
//   ReentrancyGuard - hacker attacks වලින් ආරක්ෂා වෙන්න

contract Escrow is Ownable, ReentrancyGuard {
// ↑ Escrow contract එක, Ownable සහ ReentrancyGuard උරුම කරගෙන

    IERC20 public usdc;
    // ↑ USDC token contract එක (0xA0b86991...)

    uint256 public transactionCounter;
    // ↑ ගනුදෙනු ගණන් කරන counter එක (0, 1, 2, ...)

    uint256 public constant FEE = 10;
    // ↑ ගාස්තුව 0.1% (10 / 10000 = 0.001 = 0.1%)
    //   10000 = 100% (basis points)

    address public feeRecipient;
    // ↑ ගාස්තු ලබන address එක (admin)

    struct EscrowTx {
        uint256 id;
        address sender;
        address receiver;
        uint256 amount;
        uint256 grossAmount;   // original amount (before fee) - ✅ NEW
        uint256 timestamp;
        bool released;
        bool refunded;
    }
    // ↑ Escrow transaction එකේ data structure එක
    //   id: ගනුදෙනු අංකය
    //   sender: මුදල් යවන්නා
    //   receiver: මුදල් ලබන්නා
    //   amount: මුදල
    //   timestamp: වේලාව
    //   released: නිදහස් කළාද?
    //   refunded: ආපසු ලබා දුන්නාද?

    mapping(uint256 => EscrowTx) public transactions;
    // ↑ escrowId → EscrowTx (ගනුදෙනු ගබඩාව)
    mapping(address => uint256[]) public userTransactions;

    event EscrowCreated(uint256 indexed id, address sender, address receiver, uint256 amount);
    event EscrowReleased(uint256 indexed id, address receiver, uint256 amount);
    event EscrowRefunded(uint256 indexed id, address sender, uint256 amount);
    // ↑ Events - blockchain එකේ logs තබන්න
    //   indexed = search කරන්න පුළුවන්

    constructor(address _usdc, address _feeRecipient) {
        usdc = IERC20(_usdc);
        feeRecipient = _feeRecipient;
    }
    // ↑ Contract deploy කරන විට run වෙන function එක
    //   USDC address එක සහ ගාස්තු ලබන්නා set කරනවා

    function createEscrow(address receiver, uint256 amount) 
        external 
        nonReentrant 
        returns (uint256) 
    {
        // ↑ Escrow එකක් create කරන function එක
        //   external = ගිහින්ම call කරන්න පුළුවන්
        //   nonReentrant = ආපසු එන attacks වලින් ආරක්ෂාව

        require(receiver != address(0), "Invalid receiver");
        // ↑ receiver එක 0x000... නොවිය යුතුයි

        require(amount > 0, "Amount must be > 0");
        // ↑ මුදල 0ට වඩා වැඩි විය යුතුයි

        require(usdc.balanceOf(msg.sender) >= amount, "Insufficient balance");
        // ↑ යවන්නාට ප්‍රමාණවත් USDC තියෙනවාද?

        require(usdc.allowance(msg.sender, address(this)) >= amount, "Approve USDC");
        // ↑ යවන්නා මෙම contract එකට USDC approve කරලා තියෙනවාද?

        uint256 fee = (amount * FEE) / 10000;
        // ↑ ගාස්තුව ගණනය කරනවා (amount * 10 / 10000)

        uint256 netAmount = amount - fee;
        // ↑ ගාස්තුව අඩු කළ මුදල

        usdc.transferFrom(msg.sender, address(this), amount);
        // ↑ යවන්නාගෙන් USDC contract එකට ගන්නවා

        transactionCounter++;
        // ↑ ගනුදෙනු ගණන 1ක් වැඩි කරනවා

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
        // ↑ ගනුදෙනුව save කරනවා

        userTransactions[msg.sender].push(transactionCounter);
        userTransactions[receiver].push(transactionCounter);

        if (fee > 0) {
            usdc.transfer(feeRecipient, fee);
        }
        // ↑ ගාස්තුව feeRecipient ට යවනවා

        emit EscrowCreated(transactionCounter, msg.sender, receiver, netAmount);
        // ↑ Event එක emit කරනවා

        return transactionCounter;
        // ↑ escrow ID එක return කරනවා
    }

    function releaseFunds(uint256 escrowId) external nonReentrant {
        // ↑ Escrow එකෙන් මුදල් නිදහස් කරන function එක

        EscrowTx storage escrow = transactions[escrowId];
        // ↑ escrow data එක load කරනවා

        require(msg.sender == escrow.sender || msg.sender == escrow.receiver, "Not authorized");
        // ↑ sender හෝ receiver පමණක් call කළ යුතුයි

        require(!escrow.released && !escrow.refunded, "Already processed");
        // ↑ දැනටමත් processed නොවිය යුතුයි

        escrow.released = true;
        // ↑ released කියලා mark කරනවා

        usdc.transfer(escrow.receiver, escrow.amount);
        // ↑ USDC receiver ට යවනවා

        emit EscrowReleased(escrowId, escrow.receiver, escrow.amount);
        // ↑ Event එක emit කරනවා
    }

    function refundFunds(uint256 escrowId) external nonReentrant {
        // ↑ Escrow එකෙන් මුදල් ආපසු ලබා දෙන function එක

        EscrowTx storage escrow = transactions[escrowId];

        require(escrow.sender == msg.sender, "Only sender");
        // ↑ sender පමණක් call කළ යුතුයි

        require(!escrow.released && !escrow.refunded, "Already processed");
        require(block.timestamp >= escrow.timestamp + 7 days, "Too early");
        // ↑ දින 7කට පසුව පමණක් refund කළ හැකියි

        escrow.refunded = true;
        uint256 refundAmount = escrow.grossAmount; // Full original amount
        
        // Check if contract has enough balance
        uint256 contractBalance = usdc.balanceOf(address(this));
        require(contractBalance >= refundAmount, "Insufficient contract balance");
        
        usdc.transfer(escrow.sender, escrow.amount);
        // ↑ USDC sender ට ආපසු යවනවා

        emit EscrowRefunded(escrowId, escrow.sender, escrow.amount);
    }

    function getEscrow(uint256 escrowId) external view returns (EscrowTx memory) {
        // ↑ Escrow data එක view කරන function එක
        //   view = blockchain එක වෙනස් නොකරයි

        return transactions[escrowId];
    }
    
}



