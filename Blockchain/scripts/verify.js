const { ethers } = require("hardhat");

async function main() {
  const contractAddresses = {
    MockToken: process.env.MOCK_TOKEN_ADDRESS,
    BetContract: process.env.BET_CONTRACT_ADDRESS,
    IntentRouter: process.env.INTENT_ROUTER_ADDRESS
  };

  console.log("Verifying contracts...");

  try {
    // Verify MockToken
    if (contractAddresses.MockToken) {
      console.log("Verifying MockToken...");
      await hre.run("verify:verify", {
        address: contractAddresses.MockToken,
        constructorArguments: [
          "Celo USD",
          "cUSD",
          18,
          ethers.utils.parseEther("1000000")
        ]
      });
      console.log("MockToken verified successfully");
    }

    // Verify BetContract
    if (contractAddresses.BetContract) {
      console.log("Verifying BetContract...");
      await hre.run("verify:verify", {
        address: contractAddresses.BetContract,
        constructorArguments: []
      });
      console.log("BetContract verified successfully");
    }

    // Verify IntentRouter
    if (contractAddresses.IntentRouter) {
      console.log("Verifying IntentRouter...");
      await hre.run("verify:verify", {
        address: contractAddresses.IntentRouter,
        constructorArguments: []
      });
      console.log("IntentRouter verified successfully");
    }

    console.log("All contracts verified successfully!");
  } catch (error) {
    console.error("Verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

