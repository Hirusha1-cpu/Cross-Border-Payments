// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
     // ↑ Interface - functions define කරයි, implement නොකරයි

    function totalSupply() external view returns (uint256);
    // ↑ Total tokens ගණන

      function balanceOf(address account) external view returns (uint256);
    // ↑ ගිණුමක token balance එක

     function transfer(address recipient, uint256 amount) external returns (bool);
    // ↑ Tokens transfer කරන්න

    function allowance(address owner, address spender) external view returns (uint256);
    // ↑ approve කළ token ප්‍රමාණය

    function approve(address spender, uint256 amount) external returns (bool);
    // ↑ tokens approve කරන්න

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    // ↑ tokens ගිණුමකින් transfer කරන්න

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}