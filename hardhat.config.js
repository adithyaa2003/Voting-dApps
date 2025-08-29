require("@nomicfoundation/hardhat-toolbox");

// Replace this with a private key from one of your Ganache accounts
const GANACHE_PRIVATE_KEY = "0x2a4579986e8976583314f5219110a39142d1386abb3afe415e2509f04878beb9";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24", // Make sure this matches your contract's pragma
  networks: {
    // Add this new network configuration
    ganache: {
      url: "http://127.0.0.1:7545", // The RPC server from Ganache
      accounts: [GANACHE_PRIVATE_KEY]
    }
  }
};
