import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import VotingArtifact from './artifacts/contracts/Voting.sol/Voting.json';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const contractAddress = "0xBE68f53624f2593F52B2CF31fC5C9c8ee438C511";

  const [isConnected, setIsConnected] = useState(false);
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const connectedAccount = signer.address;
        setAccount(connectedAccount);
        
        const contractInstance = new ethers.Contract(contractAddress, VotingArtifact.abi, signer);
        setContract(contractInstance);

        const ownerAddress = await contractInstance.owner();
        setIsOwner(connectedAccount.toLowerCase() === ownerAddress.toLowerCase());

        const votedStatus = await contractInstance.voters(connectedAccount);
        setHasVoted(votedStatus);

        await refreshCandidates(contractInstance);
        setIsConnected(true);
      } catch (error) {
        console.error("Connection failed:", error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const refreshCandidates = async (contractInstance) => {
    const count = await contractInstance.candidatesCount();
    const candidatesArray = [];
    for (let i = 1; i <= count; i++) {
      const candidate = await contractInstance.candidates(i);
      if (candidate.isActive) {
        candidatesArray.push({ id: Number(candidate.id), name: candidate.name, voteCount: Number(candidate.voteCount) });
      }
    }
    setCandidates(candidatesArray);
  };

  const addCandidate = async () => {
    if (contract && newCandidateName) {
      try {
        const tx = await contract.addCandidate(newCandidateName);
        await tx.wait();
        setNewCandidateName('');
        await refreshCandidates(contract);
      } catch (error) { console.error("Failed to add candidate", error); }
    }
  };

  const vote = async (candidateId) => {
    if (contract) {
      try {
        const tx = await contract.vote(candidateId);
        await tx.wait();
        setHasVoted(true);
        await refreshCandidates(contract);
      } catch (error) { alert("Voting failed! You might have already voted."); }
    }
  };

  const removeCandidate = async (candidateId) => {
    if (contract && isOwner) {
      try {
        const tx = await contract.removeCandidate(candidateId);
        await tx.wait();
        await refreshCandidates(contract);
      } catch (error) {
        console.error("Failed to remove candidate", error);
      }
    }
  };
  
  const totalVotes = candidates.reduce((acc, candidate) => acc + candidate.voteCount, 0);

  // Helper function to generate distinct colors
  const generateColors = (numColors) => {
    const colors = [];
    // You can customize these base colors or use a more sophisticated color generator
    const baseColors = [
      'rgba(255, 99, 132, 0.6)', // Red
      'rgba(54, 162, 235, 0.6)', // Blue
      'rgba(255, 206, 86, 0.6)', // Yellow
      'rgba(75, 192, 192, 0.6)', // Green
      'rgba(153, 102, 255, 0.6)',// Purple
      'rgba(255, 159, 64, 0.6)', // Orange
      'rgba(100, 100, 100, 0.6)',// Gray
      'rgba(0, 200, 0, 0.6)',   // Dark Green
      'rgba(200, 0, 200, 0.6)',  // Magenta
      'rgba(0, 200, 200, 0.6)'   // Cyan
    ];
    for (let i = 0; i < numColors; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  };

  const barColors = generateColors(candidates.length);
  const borderColors = barColors.map(color => color.replace('0.6', '1')); // Make borders opaque

  const chartData = {
    labels: candidates.map(c => c.name),
    datasets: [
      {
        label: 'Votes',
        data: candidates.map(c => c.voteCount),
        backgroundColor: barColors, // Use dynamic colors
        borderColor: borderColors,  // Use dynamic border colors
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Live Election Results', font: { size: 20 } },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1 // Ensure whole numbers for vote count
        }
      }
    }
  };

  const renderContent = () => {
    if (hasVoted || isOwner) {
      return (
        <div>
          {isOwner && (
            <div className="admin-panel">
              <h2>Admin Panel</h2>
              <input type="text" value={newCandidateName} onChange={(e) => setNewCandidateName(e.target.value)} placeholder="Enter candidate name" />
              <button className="button button-add" onClick={addCandidate}>Add Candidate</button>
            </div>
          )}
          {hasVoted && !isOwner && <h2 style={{ margin: '30px 0', color: '#16a34a' }}>Thank you for voting!</h2>}
          <div className="dashboard-container">
            <div className="stat-card"><h3>Total Votes Cast</h3><p>{totalVotes}</p></div>
            <div className="stat-card"><h3>Total Candidates</h3><p>{candidates.length}</p></div>
          </div>
          <div className="chart-container"><Bar options={chartOptions} data={chartData} /></div>
          <table className="results-table">
            <thead><tr><th>#ID</th><th>CANDIDATE NAME</th><th>VOTE COUNT</th><th>ACTION</th></tr></thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>{candidate.id}</td><td>{candidate.name}</td><td>{candidate.voteCount}</td>
                  <td>
                    {isOwner ? (
                      <button className="button button-remove" onClick={() => removeCandidate(candidate.id)}>Remove</button>
                    ) : (
                      'Voted'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <table className="results-table">
          <thead><tr><th>#ID</th><th>CANDIDATE NAME</th><th>VOTE COUNT</th><th>ACTION</th></tr></thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>{candidate.id}</td><td>{candidate.name}</td><td>{candidate.voteCount}</td>
                <td><button className="button button-vote" onClick={() => vote(candidate.id)}>Vote</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div className="poll-container">
      <div className="poll-header">
        <h1>E-VOTING ELECTION RESULTS</h1>
        <span className="live-badge">Live</span>
      </div>

      {!isConnected ? (
        <div style={{ padding: '50px 0' }}>
          <h2 style={{ marginBottom: '20px' }}>Welcome to the Decentralized Election</h2>
          <p style={{ marginBottom: '30px', color: '#555' }}>Please connect your wallet to participate.</p>
          <button className="button button-add" onClick={connectWallet}>Connect Wallet</button>
        </div>
      ) : (
        renderContent()
      )}
      
      {account && <div className="account-info"><p>YOUR ACCOUNT : {account}</p></div>}
    </div>
  );
}

export default App;