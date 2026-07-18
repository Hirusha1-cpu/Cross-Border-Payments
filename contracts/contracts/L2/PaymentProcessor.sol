// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PaymentProcessor is Ownable {
    // ↑ Ownable = admin (අයිතිකරු) තෝරා ගන්න පුළුවන්

    IERC20 public usdc;
    // ↑ USDC token contract එක

    uint256 public paymentCounter;
    // ↑ ගෙවීම් ගණන් කරන counter එක

    struct Payment {
        uint256 id;
        address sender;
        address receiver;
        uint256 amount;
        string currency;
        uint256 timestamp;
        bool completed;
        bool failed;
    }
    // ↑ Payment data structure එක
    //   currency: "USDC", "USD", "LKR", "EUR", "GBP"

    mapping(uint256 => Payment) public payments;
    // ↑ paymentId → Payment

    event PaymentCreated(uint256 indexed id, address sender, address receiver, uint256 amount);
    event PaymentCompleted(uint256 indexed id, address receiver, uint256 amount);
    event PaymentFailed(uint256 indexed id, string reason);

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }
    // ↑ USDC address එක set කරනවා

     function createPayment(
        address receiver, 
        uint256 amount, 
        string memory currency
    ) external returns (uint256) {
        // ↑ Payment request එකක් create කරන function එක

        require(receiver != address(0), "Invalid receiver");
        require(amount > 0, "Amount must be > 0");
        // ↑ Validation

        paymentCounter++;
        // ↑ ගෙවීම් ගණන 1ක් වැඩි කරනවා

        payments[paymentCounter] = Payment({
            id: paymentCounter,
            sender: msg.sender,
            receiver: receiver,
            amount: amount,
            currency: currency,
            timestamp: block.timestamp,
            completed: false,
            failed: false
        });
        // ↑ Payment save කරනවා

        emit PaymentCreated(paymentCounter, msg.sender, receiver, amount);
        // ↑ Event එක emit කරනවා

        return paymentCounter;
        // ↑ payment ID එක return කරනවා
    }

    function completePayment(uint256 paymentId) external onlyOwner {
        // ↑ ගෙවීම සම්පූර්ණ කරන function එක
        //   onlyOwner = admin පමණක් call කළ හැකියි

        Payment storage payment = payments[paymentId];
        // ↑ payment data එක load කරනවා

        require(!payment.completed && !payment.failed, "Already processed");
        // ↑ දැනටමත් processed නොවිය යුතුයි

        payment.completed = true;
        // ↑ completed කියලා mark කරනවා

        usdc.transfer(payment.receiver, payment.amount);
        // ↑ USDC receiver ට යවනවා

        emit PaymentCompleted(paymentId, payment.receiver, payment.amount);
        // ↑ Event එක emit කරනවා
    }

    function failPayment(uint256 paymentId, string memory reason) external onlyOwner {
        // ↑ ගෙවීම අසාර්ථක කරන function එක

        Payment storage payment = payments[paymentId];

        require(!payment.completed && !payment.failed, "Already processed");

        payment.failed = true;
        // ↑ failed කියලා mark කරනවා

        usdc.transfer(payment.sender, payment.amount);
        // ↑ USDC sender ට ආපසු යවනවා

        emit PaymentFailed(paymentId, reason);
        // ↑ Event එක emit කරනවා
    }

}