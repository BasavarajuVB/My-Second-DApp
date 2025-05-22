const connectBtn = document.getElementById("connectBtn");
const walletAddr = document.getElementById("walletAddr");
const inputNum = document.getElementById("inputNum");
const setBtn = document.getElementById("setBtn");
const setStatus = document.getElementById("setStatus");
const claimBtn = document.getElementById("claimBtn");
const claimResult = document.getElementById("claimResult");

const contractAddress = "0xb10b6c831ecba8e838a0ec19790b729eb44169e9";
const contractABI = [
	{
		"inputs": [],
		"name": "claim",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Claimed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_v",
				"type": "uint256"
			}
		],
		"name": "set",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "val",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "time",
				"type": "uint256"
			}
		],
		"name": "Set",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "setAt",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "val",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

let account;
let web3;
let contract;

connectBtn.onclick = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      account = accounts[0];
      walletAddr.textContent = `Connected: ${account}`;
      contract = new web3.eth.Contract(contractABI, contractAddress);
    } catch (err) {
      alert("Wallet connection failed");
    }
  } else {
    alert("MetaMask not found");
  }
};

setBtn.onclick = async () => {
  if (!contract || !account) return alert("Connect wallet first");
  const value = inputNum.value;
  if (!value) return alert("Enter a number");

  try {
    await contract.methods.set(value).send({ from: account });
    setStatus.textContent = `Value set: ${value}`;
  } catch (err) {
    alert("Error while setting value");
    console.error(err);
  }
};

claimBtn.onclick = async () => {
  if (!contract || !account) return alert("Connect wallet first");

  try {
    const lastSet = await contract.methods.setAt().call();
    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime < parseInt(lastSet) + 2 * 60 * 60) {
      const remaining = ((parseInt(lastSet) + 2 * 60 * 60) - currentTime) / 60;
      return alert(`You need to wait ${Math.ceil(remaining)} more minutes to claim`);
    }

    const receipt = await contract.methods.claim().send({ from: account });
    const claimedAmount = receipt.events.Claimed.returnValues.amount;
    claimResult.textContent = `✅ Claimed: ${claimedAmount}`;
  } catch (err) {
    alert("Claim failed");
    console.error(err);
  }
};
