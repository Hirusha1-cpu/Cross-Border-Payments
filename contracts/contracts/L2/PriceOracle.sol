// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceOracle is Ownable {
    // ↑ Ownable = admin පමණක් update කළ හැකියි

    mapping(string => uint256) public rates;
    // ↑ currency → rate (LKR → 0.0026, EUR → 1.08)

    mapping(string => uint256) public lastUpdate;
    // ↑ currency → last update timestamp

    event RateUpdated(string currency, uint256 price);

    function getRate(string memory currency) external view returns (uint256) {
        // ↑ මුදල් අනුපාතිකය ලබා ගන්න

        require(rates[currency] > 0, "Rate not available");
        // ↑ rate එක තියෙනවාද?

        return rates[currency];
        // ↑ rate එක return කරනවා
    }

    function updateRate(string memory currency, uint256 price) external onlyOwner {
        // ↑ මුදල් අනුපාතිකය update කරන්න (Admin පමණක්)

        require(price > 0, "Invalid price");
        // ↑ price එක 0ට වඩා වැඩි විය යුතුයි

        rates[currency] = price;
        // ↑ rate එක save කරනවා

        lastUpdate[currency] = block.timestamp;
        // ↑ update වේලාව save කරනවා

        emit RateUpdated(currency, price);
        // ↑ Event එක emit කරනවා
    }

    function isRateValid(string memory currency) external view returns (bool) {
        // ↑ rate එක වලංගුද? (පැය 1ක් ඇතුළත update වෙලාද?)

        return rates[currency] > 0 && block.timestamp - lastUpdate[currency] < 1 hours;
        // ↑ rate තියෙනවාද? සහ පැය 1ක් ඇතුළත update වෙලාද?
    }
}