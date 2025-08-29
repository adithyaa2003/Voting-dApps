// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// This is the main contract for our voting application
contract Voting {
    // We will use this to store the address of the contract owner/admin
    address public owner;

    // A structure to represent a candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
        bool isActive; // Flag to mark if the candidate is active.
    }

    // A mapping to keep track of who has already voted
    // It maps an address to a boolean value (true if they have voted)
    mapping(address => bool) public voters;

    // A mapping to store all the candidates
    // It maps a unique ID (uint) to a Candidate struct
    mapping(uint => Candidate) public candidates;

    // A counter to keep track of the number of candidates
    uint public candidatesCount;

    // Event to be emitted when a vote is cast
    event votedEvent (
        uint indexed _candidateId
    );

    // The constructor runs only once when the contract is deployed
    constructor() {
        // Set the owner to the address that deployed the contract
        owner = msg.sender;
    }

    // Modifier to restrict a function to be called only by the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    // Function to add a new candidate, restricted to the owner
    function addCandidate(string memory _name) public onlyOwner {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0,true);
    }

    // Function for a user to cast their vote
    function vote(uint _candidateId) public {
        // Requirement 1: Check if the voter has not already voted
        require(!voters[msg.sender], "You have already voted.");

        // Requirement 2: Check if the candidate ID is valid
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate.");

        // Record that this address has now voted
        voters[msg.sender] = true;

        // Increment the vote count for the chosen candidate
        candidates[_candidateId].voteCount++;

        // Trigger the votedEvent
        emit votedEvent(_candidateId);
    }

    // Allows the owner to deactivate a candidate.
    function removeCandidate(uint _candidateId) public onlyOwner {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");
        candidates[_candidateId].isActive = false;
    }
}