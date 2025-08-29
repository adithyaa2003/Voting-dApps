// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");

async function main() {
  // Get the contract factory for our "Voting" contract
  const Voting = await hre.ethers.getContractFactory("Voting");

  // Deploy the contract
  const voting = await Voting.deploy();

  // Wait for the deployment to be confirmed
  await voting.waitForDeployment();

  // Log the address of the deployed contract to the console
  console.log(`Voting contract deployed to: ${voting.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


