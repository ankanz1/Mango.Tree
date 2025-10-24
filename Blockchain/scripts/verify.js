const { run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 Starting contract verification on CeloScan (Sepolia)...");
  console.log("========================================================");

  // Read deployment info
  const deploymentPath = path.join(__dirname, "..", "deployedAddresses.json");
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ deployedAddresses.json not found!");
    console.log("💡 Please run deployment first: npx hardhat run scripts/deploy.js --network celoSepolia");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contractAddress = deploymentInfo.contracts.MangoTree;
  const treasuryAddress = deploymentInfo.treasury;

  if (!contractAddress) {
    console.error("❌ Contract address not found in deployment info!");
    process.exit(1);
  }

  console.log("📝 Contract address:", contractAddress);
  console.log("🏦 Treasury address:", treasuryAddress);
  console.log("🌐 Network:", deploymentInfo.network);

  // Check if CELOSCAN_API_KEY is set
  if (!process.env.CELOSCAN_API_KEY) {
    console.error("❌ CELOSCAN_API_KEY not found in environment variables!");
    console.log("💡 Please add CELOSCAN_API_KEY to your .env file");
    console.log("🔗 Get API key from: https://celoscan.io/apis");
    process.exit(1);
  }

  console.log("\n⏳ Verifying contract on CeloScan...");
  console.log("⏳ This may take a few minutes...");

  try {
    // Verify the contract
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [treasuryAddress],
      network: "celoSepolia"
    });

    console.log("✅ Contract verified successfully!");
    console.log("🔗 CeloScan link:", `https://sepolia.celoscan.io/address/${contractAddress}`);
    
    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verifiedAt = new Date().toISOString();
    deploymentInfo.celoscanUrl = `https://sepolia.celoscan.io/address/${contractAddress}`;
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("📁 Updated deployment info with verification status");

  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    
    // Check if contract is already verified
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
      console.log("🔗 CeloScan link:", `https://sepolia.celoscan.io/address/${contractAddress}`);
    } else if (error.message.includes("Contract source code already verified")) {
      console.log("✅ Contract source code is already verified!");
      console.log("🔗 CeloScan link:", `https://sepolia.celoscan.io/address/${contractAddress}`);
    } else {
      console.log("\n🔧 Troubleshooting tips:");
      console.log("1. Make sure CELOSCAN_API_KEY is correct");
      console.log("2. Wait a few minutes after deployment before verifying");
      console.log("3. Check if contract was deployed correctly");
      console.log("4. Verify constructor arguments match deployment");
      
      console.log("\n📋 Manual verification command:");
      console.log(`npx hardhat verify --network celoSepolia ${contractAddress} "${treasuryAddress}"`);
    }
    
    process.exit(1);
  }

  console.log("\n🎉 Verification Summary:");
  console.log("========================");
  console.log(`Contract: MangoTree`);
  console.log(`Address: ${contractAddress}`);
  console.log(`Treasury: ${treasuryAddress}`);
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`Status: ✅ Verified`);
  console.log(`CeloScan: https://sepolia.celoscan.io/address/${contractAddress}`);
  
  console.log("\n🔍 Next steps:");
  console.log("1. Test contract functions on CeloScan");
  console.log("2. Update frontend/backend with verified contract address");
  console.log("3. Deploy additional contracts if needed");
  
  console.log("\n✨ Contract verification completed successfully! 🌳");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification script failed:", error);
    process.exit(1);
  });