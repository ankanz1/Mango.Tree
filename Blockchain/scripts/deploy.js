const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🌳 Starting Mango Tree deployment on Celo Sepolia...");
  console.log("==================================================");

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
  
  if (balance < ethers.parseEther("0.1")) {
    console.log("⚠️  Warning: Low balance! You may need more CELO for deployment.");
    console.log("💡 Get testnet CELO from: https://faucet.celo.org/sepolia");
  }

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId + ")");

  // Set treasury address (you can change this to your desired treasury address)
  const treasuryAddress = deployer.address; // Using deployer as treasury for now
  console.log("🏦 Treasury address:", treasuryAddress);

  console.log("\n🚀 Deploying MangoTree contract...");
  console.log("⏳ Deployment in progress...");

  // Deploy MangoTree contract
  const MangoTree = await ethers.getContractFactory("MangoTree");
  const mangoTree = await MangoTree.deploy(treasuryAddress);
  
  console.log("⏳ Waiting for deployment confirmation...");
  await mangoTree.waitForDeployment();

  // Get deployment transaction details
  const deployTx = mangoTree.deploymentTransaction();
  const receipt = await deployTx.wait();
  
  console.log("✅ MangoTree deployed successfully!");
  console.log("📍 Contract address:", await mangoTree.getAddress());
  console.log("⛽ Gas used:", receipt.gasUsed.toString());
  console.log("💸 Gas price:", ethers.formatUnits(deployTx.gasPrice, "gwei"), "gwei");
  console.log("💰 Total cost:", ethers.formatEther(receipt.gasUsed * deployTx.gasPrice), "CELO");

  // Create deployment info object
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    treasury: treasuryAddress,
    contracts: {
      MangoTree: await mangoTree.getAddress()
    },
    deployment: {
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: deployTx.gasPrice.toString(),
      totalCost: ethers.formatEther(receipt.gasUsed * deployTx.gasPrice)
    },
    celoscan: {
      contractUrl: `https://sepolia.celoscan.io/address/${await mangoTree.getAddress()}`,
      txUrl: `https://sepolia.celoscan.io/tx/${deployTx.hash}`
    }
  };

  // Save deployment info to deployedAddresses.json
  const deploymentPath = path.join(__dirname, "..", "deployedAddresses.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value, 2));
  
  console.log("\n📁 Deployment info saved to:", deploymentPath);
  console.log("🔗 CeloScan contract link:", deploymentInfo.celoscan.contractUrl);
  console.log("🔗 CeloScan transaction link:", deploymentInfo.celoscan.txUrl);

  // Verify contract is working
  console.log("\n🧪 Testing deployed contract...");
  const treasuryFromContract = await mangoTree.treasury();
  const totalBets = await mangoTree.totalBets();
  
  console.log("✅ Treasury address verified:", treasuryFromContract);
  console.log("✅ Initial total bets:", totalBets.toString());

  // Display final summary
  console.log("\n🎉 Deployment Summary:");
  console.log("======================");
  console.log(`Contract: MangoTree`);
  console.log(`Address: ${await mangoTree.getAddress()}`);
  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Treasury: ${treasuryAddress}`);
  console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
  console.log(`Total Cost: ${ethers.formatEther(receipt.gasUsed * deployTx.gasPrice)} CELO`);
  
  console.log("\n🔍 Next steps:");
  console.log("1. Verify contract: npx hardhat run scripts/verify.js --network celoSepolia");
  console.log("2. Test contract functions on CeloScan");
  console.log("3. Update frontend/backend with contract address");
  
  console.log("\n✨ Mango Tree deployment completed successfully! 🌳");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });