const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Mango Tree contracts...");

  // Get the contract factories
  const MockToken = await ethers.getContractFactory("MockToken");
  const BetEscrow = await ethers.getContractFactory("BetEscrow");
  const BetContract = await ethers.getContractFactory("BetContract");
  const IntentRouter = await ethers.getContractFactory("IntentRouter");
  const VRFConsumer = await ethers.getContractFactory("VRFConsumer");
  const GameLogic = await ethers.getContractFactory("GameLogic");
  const TestContract = await ethers.getContractFactory("TestContract");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy MockToken (cUSD for testing)
  console.log("\n📄 Deploying MockToken (cUSD)...");
  const mockToken = await MockToken.deploy(
    "Celo USD",
    "cUSD",
    18,
    ethers.utils.parseEther("1000000") // 1M tokens
  );
  await mockToken.deployed();
  console.log("✅ MockToken deployed to:", mockToken.address);

  // Deploy BetEscrow
  console.log("\n🏦 Deploying BetEscrow...");
  const betEscrow = await BetEscrow.deploy();
  await betEscrow.deployed();
  console.log("✅ BetEscrow deployed to:", betEscrow.address);

  // Deploy VRFConsumer
  console.log("\n🎲 Deploying VRFConsumer...");
  const vrfConsumer = await VRFConsumer.deploy();
  await vrfConsumer.deployed();
  console.log("✅ VRFConsumer deployed to:", vrfConsumer.address);

  // Deploy GameLogic
  console.log("\n🎮 Deploying GameLogic...");
  const gameLogic = await GameLogic.deploy(vrfConsumer.address);
  await gameLogic.deployed();
  console.log("✅ GameLogic deployed to:", gameLogic.address);

  // Deploy BetContract
  console.log("\n🎲 Deploying BetContract...");
  const betContract = await BetContract.deploy(betEscrow.address);
  await betContract.deployed();
  console.log("✅ BetContract deployed to:", betContract.address);

  // Deploy IntentRouter
  console.log("\n🌉 Deploying IntentRouter...");
  const intentRouter = await IntentRouter.deploy();
  await intentRouter.deployed();
  console.log("✅ IntentRouter deployed to:", intentRouter.address);

  // Deploy TestContract (optional, for testing)
  console.log("\n🧪 Deploying TestContract...");
  const testContract = await TestContract.deploy();
  await testContract.deployed();
  console.log("✅ TestContract deployed to:", testContract.address);

  // Configure contracts
  console.log("\n⚙️ Configuring contracts...");
  
  // Add cUSD as supported token in BetContract
  await betContract.addSupportedToken(mockToken.address);
  console.log("✅ Added cUSD as supported token in BetContract");

  // Add cUSD as supported token in IntentRouter
  await intentRouter.addSupportedToken(mockToken.address);
  console.log("✅ Added cUSD as supported token in IntentRouter");

  // Add cUSD as supported token in BetEscrow
  await betEscrow.addSupportedToken(mockToken.address);
  console.log("✅ Added cUSD as supported token in BetEscrow");

  // Set up authorized contracts
  await betEscrow.addAuthorizedContract(betContract.address);
  console.log("✅ Added BetContract as authorized in BetEscrow");

  // Set up authorized resolvers (for testing, we'll use the deployer)
  await betContract.addAuthorizedResolver(deployer.address);
  console.log("✅ Added deployer as authorized resolver");

  // Add deployer as authorized solver for IntentRouter
  await intentRouter.addAuthorizedSolver(deployer.address);
  console.log("✅ Added deployer as authorized solver");

  // Save deployment info
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      MockToken: {
        address: mockToken.address,
        name: "Celo USD",
        symbol: "cUSD",
        decimals: 18
      },
      BetEscrow: {
        address: betEscrow.address
      },
      BetContract: {
        address: betContract.address
      },
      IntentRouter: {
        address: intentRouter.address
      },
      VRFConsumer: {
        address: vrfConsumer.address
      },
      GameLogic: {
        address: gameLogic.address
      },
      TestContract: {
        address: testContract.address
      }
    },
    configuration: {
      platformFee: "2.5%",
      processingFee: "0.001 ETH",
      supportedTokens: [mockToken.address],
      authorizedResolvers: [deployer.address],
      authorizedSolvers: [deployer.address]
    }
  };

  // Save to file
  const deploymentPath = path.join(__dirname, "..", "deployments", `${network.name}-${network.chainId}.json`);
  const deploymentDir = path.dirname(deploymentPath);
  
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📁 Deployment info saved to: ${deploymentPath}`);

  // Display summary
  console.log("\n🎉 Deployment Summary:");
  console.log("========================");
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`MockToken (cUSD): ${mockToken.address}`);
  console.log(`BetEscrow: ${betEscrow.address}`);
  console.log(`BetContract: ${betContract.address}`);
  console.log(`IntentRouter: ${intentRouter.address}`);
  console.log(`VRFConsumer: ${vrfConsumer.address}`);
  console.log(`GameLogic: ${gameLogic.address}`);
  console.log(`TestContract: ${testContract.address}`);
  console.log("\n✨ All contracts deployed successfully!");

  // Verify contracts (if on a supported network)
  if (network.chainId !== 1337) { // Not local hardhat
    console.log("\n🔍 To verify contracts, run:");
    console.log(`npx hardhat verify --network ${network.name} ${mockToken.address} "Celo USD" "cUSD" 18 ${ethers.utils.parseEther("1000000")}`);
    console.log(`npx hardhat verify --network ${network.name} ${betEscrow.address}`);
    console.log(`npx hardhat verify --network ${network.name} ${betContract.address}`);
    console.log(`npx hardhat verify --network ${network.name} ${intentRouter.address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });