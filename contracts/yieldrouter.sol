// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title YieldRouter - Cross-Chain DeFi Aggregator
 * @dev Kontrak inti untuk mengelola strategi yield farming dan operasi lintas chain
 */
contract YieldRouter is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Events
    event StrategyDeployed(address indexed user, uint256 indexed strategyId, address token, uint256 amount, string targetChain);
    event YieldHarvested(address indexed user, uint256 indexed strategyId, uint256 rewards, uint256 timestamp);
    event CrossChainBridge(address indexed user, address fromToken, address toToken, uint256 amount, string targetChain, bytes32 bridgeHash);

    // Structs
    struct Strategy {
        uint256 id;
        address user;
        address token;
        uint256 amount;
        uint256 deployedAt;
        string protocol;
        string targetChain;
        uint256 totalRewards;
        bool active;
    }

    struct ProtocolConfig {
        address contractAddress;
        uint256 minDeposit;
        uint256 performanceFee; // basis points (100 = 1%)
        bool active;
    }

    struct YieldData {
        uint256 apy;
        uint256 tvl;
        uint256 lastUpdate;
    }

    // State variables
    mapping(uint256 => Strategy) public strategies;
    mapping(address => uint256[]) public userStrategies;
    mapping(string => ProtocolConfig) public protocols;
    mapping(string => YieldData) public yieldRates;
    mapping(address => mapping(address => uint256)) public userBalances;

    uint256 public nextStrategyId = 1;
    uint256 public totalValueLocked;
    uint256 public performanceFee = 200; // 2%
    address public treasury;

    mapping(address => bool) public supportedTokens;
    address[] public tokenList;

    constructor(address _treasury) {
        treasury = _treasury;

        // Contoh konfigurasi protokol (testnet)
        protocols["aave"] = ProtocolConfig({
            contractAddress: address(0x0000000000000000000000000000000000000001),
            minDeposit: 1 ether,
            performanceFee: 200,
            active: true
        });

        protocols["compound"] = ProtocolConfig({
            contractAddress: address(0x0000000000000000000000000000000000000002),
            minDeposit: 1 ether,
            performanceFee: 250,
            active: true
        });
    }

    // Fungsi utama
    function deployStrategy(address _token, uint256 _amount, string memory _protocol, string memory _targetChain) external nonReentrant {
        require(supportedTokens[_token], "Token not supported");
        require(protocols[_protocol].active, "Protocol not active");
        require(_amount >= protocols[_protocol].minDeposit, "Amount below minimum");

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        uint256 strategyId = nextStrategyId++;

        strategies[strategyId] = Strategy({
            id: strategyId,
            user: msg.sender,
            token: _token,
            amount: _amount,
            deployedAt: block.timestamp,
            protocol: _protocol,
            targetChain: _targetChain,
            totalRewards: 0,
            active: true
        });

        userStrategies[msg.sender].push(strategyId);
        userBalances[msg.sender][_token] += _amount;
        totalValueLocked += _amount;

        _integrateWithProtocol(_token, _amount, _protocol);

        emit StrategyDeployed(msg.sender, strategyId, _token, _amount, _targetChain);
    }

    function harvestRewards(uint256 _strategyId) external nonReentrant {
        Strategy storage strategy = strategies[_strategyId];
        require(strategy.user != address(0), "Strategy does not exist");
        require(strategy.user == msg.sender, "Not strategy owner");
        require(strategy.active, "Strategy not active");

        uint256 rewards = _calculateRewards(_strategyId);
        require(rewards > 0, "No rewards available");

        uint256 fee = (rewards * performanceFee) / 10000;
        uint256 userRewards = rewards - fee;

        strategy.totalRewards += userRewards;
        userBalances[msg.sender][strategy.token] += userRewards;

        IERC20(strategy.token).safeTransfer(msg.sender, userRewards);
        IERC20(strategy.token).safeTransfer(treasury, fee);

        emit YieldHarvested(msg.sender, _strategyId, userRewards, block.timestamp);
    }

    function initiateBridge(address _fromToken, address _toToken, uint256 _amount, string memory _targetChain) external nonReentrant returns (bytes32) {
        require(supportedTokens[_fromToken], "From token not supported");
        require(_amount > 0, "Amount must be greater than 0");

        IERC20(_fromToken).safeTransferFrom(msg.sender, address(this), _amount);

        bytes32 bridgeHash = keccak256(abi.encodePacked(msg.sender, _fromToken, _toToken, _amount, block.timestamp));

        emit CrossChainBridge(msg.sender, _fromToken, _toToken, _amount, _targetChain, bridgeHash);

        return bridgeHash;
    }

    function getUserStrategies(address _user) external view returns (uint256[] memory) {
        return userStrategies[_user];
    }

    function getStrategy(uint256 _strategyId) external view returns (Strategy memory) {
        require(strategies[_strategyId].user != address(0), "Strategy does not exist");
        return strategies[_strategyId];
    }

    function calculatePotentialRewards(uint256 _strategyId) external view returns (uint256) {
        return _calculateRewards(_strategyId);
    }

    function getBestYield(address /* _token */) external view returns (string memory bestProtocol, uint256 bestApy) {
        bestApy = 0;

        string[] memory protocolNames = new string[](2);
        protocolNames[0] = "aave";
        protocolNames[1] = "compound";

        for (uint i = 0; i < protocolNames.length; i++) {
            if (protocols[protocolNames[i]].active) {
                uint256 currentApy = yieldRates[protocolNames[i]].apy;
                if (currentApy > bestApy) {
                    bestApy = currentApy;
                    bestProtocol = protocolNames[i];
                }
            }
        }
    }

    // Internal
    function _calculateRewards(uint256 _strategyId) internal view returns (uint256) {
        Strategy storage strategy = strategies[_strategyId];
        if (!strategy.active || strategy.user == address(0)) return 0;

        uint256 timeElapsed = block.timestamp - strategy.deployedAt;
        uint256 apy = yieldRates[strategy.protocol].apy;

        if (apy == 0) apy = 500;

        return (strategy.amount * apy * timeElapsed) / (10000 * 365 days);
    }

    function _integrateWithProtocol(address _token, uint256 _amount, string memory _protocol) internal {
        // Simulasi integrasi protokol
    }

    // Admin
    function addSupportedToken(address _token) external onlyOwner {
        require(!supportedTokens[_token], "Token already supported");
        supportedTokens[_token] = true;
        tokenList.push(_token);
    }

    function updateYieldRate(string memory _protocol, uint256 _apy, uint256 _tvl) external onlyOwner {
        yieldRates[_protocol] = YieldData({apy: _apy, tvl: _tvl, lastUpdate: block.timestamp});
    }

    function updateProtocol(string memory _protocol, address _contractAddress, uint256 _minDeposit, uint256 _performanceFee, bool _active) external onlyOwner {
        protocols[_protocol] = ProtocolConfig({
            contractAddress: _contractAddress,
            minDeposit: _minDeposit,
            performanceFee: _performanceFee,
            active: _active
        });
    }

    function setPerformanceFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high");
        performanceFee = _fee;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    // Emergency
    function emergencyWithdraw(uint256 _strategyId) external nonReentrant {
        Strategy storage strategy = strategies[_strategyId];
        require(strategy.user != address(0), "Strategy does not exist");
        require(strategy.user == msg.sender, "Not strategy owner");
        require(strategy.active, "Strategy not active");

        strategy.active = false;
        userBalances[msg.sender][strategy.token] -= strategy.amount;
        totalValueLocked -= strategy.amount;

        IERC20(strategy.token).safeTransfer(msg.sender, strategy.amount);
    }

    // ETH receive
    receive() external payable {}
    fallback() external payable {}
}