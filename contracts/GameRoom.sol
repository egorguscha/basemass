// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./BlazarNFT.sol";

contract GameRoom {
    using ECDSA for bytes32;

    address public admin;
    address public serverManager;
    uint256 public constant ENTRY_FEE = 0.002 ether;
    uint256 public constant MAX_PLAYERS = 10;
    uint256 public gameDurationBlocks;
    uint256 public finalBlock;
    uint256 public prizePool;
    address[] public players;

    BlazarNFT public nftContract;

    struct PlayerScore {
        address player;
        uint256 score;
    }

    enum GameState {
        Waiting,
        Active,
        Ended
    }
    GameState public currentState = GameState.Waiting;

    mapping(address => bool) public hasEntered;

    event GameStarted(uint256 finalBlock);
    event PrizeClaimed(address winner, uint256 amount);

    constructor(
        address _admin,
        address _serverManager,
        address _nftAddress,
        uint256 _gameDurationBlocks
    ) {
        require(_admin != address(0), "Admin address cannot be zero");
        require(
            _serverManager != address(0),
            "Server Manager address cannot be zero"
        );
        admin = _admin;
        serverManager = _serverManager;
        gameDurationBlocks = _gameDurationBlocks;
        nftContract = BlazarNFT(_nftAddress);
    }

    function enterRoom() external payable {
        require(currentState == GameState.Waiting, "Game not in waiting state");
        require(msg.value == ENTRY_FEE, "Incorrect entry fee");
        require(players.length < MAX_PLAYERS, "Room is full");
        require(!hasEntered[msg.sender], "Player has already entered");
        require(
            nftContract.balanceOf(msg.sender) > 0,
            "Must own the NFT to play"
        );

        players.push(msg.sender);
        hasEntered[msg.sender] = true;
        prizePool += msg.value;

        if (players.length == MAX_PLAYERS) {
            _startGame();
        }
    }

    function _startGame() private {
        finalBlock = block.number + gameDurationBlocks;
        currentState = GameState.Active;
        emit GameStarted(finalBlock);
    }

    function endGame(
        bytes32 dataHash,
        bytes memory signature,
        PlayerScore[] calldata scores
    ) external {
        require(currentState == GameState.Active, "Game not active");
        require(block.number >= finalBlock, "Game not finished yet");
        require(scores.length == MAX_PLAYERS, "Invalid scores length");

        _verifySignature(dataHash, signature);
        _verifyScores(dataHash, scores);

        _distributePrizes(scores);
        _resetGameState();
    }

    function _verifySignature(
        bytes32 dataHash,
        bytes memory signature
    ) private view {
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(
            dataHash
        );
        address signer = ECDSA.recover(ethSignedMessageHash, signature);
        require(signer == serverManager, "Invalid signature");
    }

    function _verifyScores(
        bytes32 dataHash,
        PlayerScore[] calldata scores
    ) private pure {
        bytes32 expectedHash;
        for (uint256 i = 0; i < scores.length; i++) {
            expectedHash = keccak256(
                abi.encode(expectedHash, scores[i].player, scores[i].score)
            );
        }
        require(dataHash == expectedHash, "Data does not match scores");
    }

    function _distributePrizes(PlayerScore[] calldata scores) private {
        require(
            scores.length == MAX_PLAYERS,
            "Invalid number of players for prize distribution"
        );

        uint256 firstPrize = (prizePool * 42) / 100;
        uint256 secondPrize = (prizePool * 21) / 100;
        uint256 thirdPrize = (prizePool * 14) / 100;
        uint256 callerPrize = (prizePool * 3) / 100;
        uint256 serverManagerPrize = (prizePool * 10) / 100;
        uint256 adminPrize = (prizePool * 10) / 100;

        _transferPrize(scores[0].player, firstPrize);
        _transferPrize(scores[1].player, secondPrize);
        _transferPrize(scores[2].player, thirdPrize);
        _transferPrize(msg.sender, callerPrize);
        _transferPrize(serverManager, serverManagerPrize);
        _transferPrize(admin, adminPrize);

        prizePool = 0;
    }

    function _transferPrize(address recipient, uint256 amount) private {
        (bool success, ) = payable(recipient).call{value: amount}("");
        if (success) emit PrizeClaimed(recipient, amount);
    }

    function _resetGameState() private {
        currentState = GameState.Waiting;

        for (uint256 i = 0; i < players.length; i++) {
            hasEntered[players[i]] = false;
        }

        delete players;
        prizePool = 0;
    }

    function refund() external {
        require(
            currentState == GameState.Waiting,
            "Refunds only during waiting state"
        );
        require(players.length < 8, "Too many players for refunds");
        require(hasEntered[msg.sender], "Player has not entered");

        hasEntered[msg.sender] = false;
        _removePlayer(msg.sender);

        payable(msg.sender).transfer(ENTRY_FEE);
    }

    function _removePlayer(address player) private {
        uint256 index = _findPlayerIndex(player);
        for (uint256 i = index; i < players.length - 1; i++) {
            players[i] = players[i + 1];
        }
        players.pop();
    }

    function _findPlayerIndex(address player) private view returns (uint256) {
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i] == player) {
                return i;
            }
        }
        revert("Player not found");
    }

    function getPlayers() external view returns (address[] memory) {
        return players;
    }

    receive() external payable {
        prizePool += msg.value;
    }

    function withdraw() external {
        require(msg.sender == admin, "Only admin can withdraw");
        uint256 balance = address(this).balance;
        payable(admin).transfer(balance);
    }
}
