const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🌳 Starting Complete Mango Tree Deployment on Celo Sepolia...");
  console.log("=============================================================");

  // Get the deployer account
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    console.error("❌ No signers available. Please check your private key configuration.");
    process.exit(1);
  }
  const deployer = signers[0];
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "CELO");
  
  if (balance < ethers.parseEther("0.5")) {
    console.log("⚠️  Warning: Low balance! You may need more CELO for deployment.");
    console.log("💡 Get testnet CELO from: https://faucet.celo.org/sepolia");
  }

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId + ")");

  const deployedContracts = {};
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {},
    deployment: {
      totalGasUsed: 0,
      totalCost: "0"
    },
    celoscan: {}
  };

  console.log("\n🚀 Starting contract deployments...");
  console.log("=====================================");

  try {
    // 1. Deploy MockToken first (no dependencies)
    console.log("\n1️⃣ Deploying MockToken...");
    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy(
      "Mango Token", 
      "MANGO", 
      18, 
      ethers.parseEther("1000000") // 1M tokens
    );
    await mockToken.waitForDeployment();
    const mockTokenAddress = await mockToken.getAddress();
    deployedContracts.MockToken = mockTokenAddress;
    console.log("✅ MockToken deployed at:", mockTokenAddress);

    // 2. Deploy VRFConsumer (no dependencies)
    console.log("\n2️⃣ Deploying VRFConsumer...");
    const VRFConsumer = await ethers.getContractFactory("VRFConsumer");
    const vrfConsumer = await VRFConsumer.deploy();
    await vrfConsumer.waitForDeployment();
    const vrfConsumerAddress = await vrfConsumer.getAddress();
    deployedContracts.VRFConsumer = vrfConsumerAddress;
    console.log("✅ VRFConsumer deployed at:", vrfConsumerAddress);

    // 3. Deploy BetEscrow (no dependencies)
    console.log("\n3️⃣ Deploying BetEscrow...");
    const BetEscrow = await ethers.getContractFactory("BetEscrow");
    const betEscrow = await BetEscrow.deploy();
    await betEscrow.waitForDeployment();
    const betEscrowAddress = await betEscrow.getAddress();
    deployedContracts.BetEscrow = betEscrowAddress;
    console.log("✅ BetEscrow deployed at:", betEscrowAddress);

    // 4. Deploy GameLogic (depends on VRFConsumer)
    console.log("\n4️⃣ Deploying GameLogic...");
    const GameLogic = await ethers.getContractFactory("GameLogic");
    const gameLogic = await GameLogic.deploy(vrfConsumerAddress);
    await gameLogic.waitForDeployment();
    const gameLogicAddress = await gameLogic.getAddress();
    deployedContracts.GameLogic = gameLogicAddress;
    console.log("✅ GameLogic deployed at:", gameLogicAddress);

    // 5. Deploy BetContract (depends on BetEscrow)
    console.log("\n5️⃣ Deploying BetContract...");
    const BetContract = await ethers.getContractFactory("BetContract");
    const betContract = await BetContract.deploy(betEscrowAddress);
    await betContract.waitForDeployment();
    const betContractAddress = await betContract.getAddress();
    deployedContracts.BetContract = betContractAddress;
    console.log("✅ BetContract deployed at:", betContractAddress);

    // 6. Deploy IntentRouter (no dependencies)
    console.log("\n6️⃣ Deploying IntentRouter...");
    const IntentRouter = await ethers.getContractFactory("IntentRouter");
    const intentRouter = await IntentRouter.deploy();
    await intentRouter.waitForDeployment();
    const intentRouterAddress = await intentRouter.getAddress();
    deployedContracts.IntentRouter = intentRouterAddress;
    console.log("✅ IntentRouter deployed at:", intentRouterAddress);

    // 7. Deploy MangoTree (already deployed, but let's get the address)
    console.log("\n7️⃣ MangoTree Contract...");
    const MangoTree = await ethers.getContractFactory("MangoTree");
    const mangoTree = await MangoTree.deploy(deployer.address);
    await mangoTree.waitForDeployment();
    const mangoTreeAddress = await mangoTree.getAddress();
    deployedContracts.MangoTree = mangoTreeAddress;
    console.log("✅ MangoTree deployed at:", mangoTreeAddress);

    // Calculate total gas and cost
    let totalGasUsed = 0;
    let totalCost = BigInt(0);

    // Get deployment transactions and calculate costs
    const contracts = [
      { name: "MockToken", contract: mockToken },
      { name: "VRFConsumer", contract: vrfConsumer },
      { name: "BetEscrow", contract: betEscrow },
      { name: "GameLogic", contract: gameLogic },
      { name: "BetContract", contract: betContract },
      { name: "IntentRouter", contract: intentRouter },
      { name: "MangoTree", contract: mangoTree }
    ];

    for (const { name, contract } of contracts) {
      try {
        const deployTx = contract.deploymentTransaction();
        if (deployTx) {
          const receipt = await deployTx.wait();
          totalGasUsed += Number(receipt.gasUsed);
          totalCost += receipt.gasUsed * deployTx.gasPrice;
          
          deploymentInfo.contracts[name] = {
            address: deployedContracts[name],
            gasUsed: receipt.gasUsed.toString(),
            gasPrice: deployTx.gasPrice.toString(),
            txHash: deployTx.hash
          };
          
          deploymentInfo.celoscan[name] = {
            contractUrl: `https://sepolia.celoscan.io/address/${deployedContracts[name]}`,
            txUrl: `https://sepolia.celoscan.io/tx/${deployTx.hash}`
          };
        }
      } catch (error) {
        console.log(`⚠️  Could not get deployment details for ${name}:`, error.message);
      }
    }

    deploymentInfo.deployment.totalGasUsed = totalGasUsed;
    deploymentInfo.deployment.totalCost = ethers.formatEther(totalCost);

    // Save deployment info
    const deploymentPath = path.join(__dirname, "..", "deployedAddresses.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value, 2));

    console.log("\n🎉 All Contracts Deployed Successfully!");
    console.log("=====================================");
    console.log("📊 Deployment Summary:");
    console.log(`Total Gas Used: ${totalGasUsed.toLocaleString()}`);
    console.log(`Total Cost: ${ethers.formatEther(totalCost)} CELO`);
    console.log(`Contracts Deployed: ${Object.keys(deployedContracts).length}`);

    console.log("\n📍 Contract Addresses:");
    console.log("====================");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });

    console.log("\n🔗 CeloScan Links:");
    console.log("==================");
    Object.entries(deploymentInfo.celoscan).forEach(([name, links]) => {
      console.log(`${name}: ${links.contractUrl}`);
    });

    console.log("\n📁 Deployment info saved to:", deploymentPath);
    console.log("\n✨ Complete Mango Tree deployment finished! 🌳");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
