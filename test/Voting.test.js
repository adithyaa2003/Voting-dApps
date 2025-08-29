const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let voting;
  let owner;

  // This block runs before each test
  beforeEach(async function () {
    // Get the contract owner's address
    [owner] = await ethers.getSigners();

    // Deploy a new instance of our Voting contract
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
    // await voting.deployed() is no longer needed with ethers.js v6 / hardhat-ethers v3
    // but it's good practice to ensure the contract is mined.
    await voting.waitForDeployment(); 
  });

  it("Should allow the owner to add a candidate", async function () {
    // Add a candidate named "Candidate 1"
    await voting.connect(owner).addCandidate("Candidate 1");

    // Retrieve the candidate we just added
    const candidate = await voting.candidates(1);

    // Assert that the candidate's name is correct
    expect(candidate.name).to.equal("Candidate 1");

    // Assert that the initial vote count is 0
    expect(candidate.voteCount).to.equal(0);
  });
});