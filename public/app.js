const contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138';

let web3;
let contract;
let accounts = [];

async function connectWallet() {
  if (window.ethereum) {
    try {
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      document.getElementById('wallet-status').innerText = `Connected: ${accounts[0]}`;

      web3 = new Web3(window.ethereum);
      const response = await fetch('abi.json');
      const contractABI = await response.json();
      contract = new web3.eth.Contract(contractABI, contractAddress);

      loadTasks();

      // Listen for account change
      window.ethereum.on('accountsChanged', (accs) => {
        accounts = accs;
        if (accounts.length > 0) {
          document.getElementById('wallet-status').innerText = `Connected: ${accounts[0]}`;
          loadTasks();
        } else {
          document.getElementById('wallet-status').innerText = 'Wallet not connected';
          document.getElementById('tasksList').innerHTML = '';
        }
      });

      // Listen for network change (optional)
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      // Disable connect wallet button after connection
      document.getElementById('connectWalletBtn').disabled = true;

    } catch (error) {
      alert('User denied wallet connection');
    }
  } else {
    alert('Please install MetaMask to use this dApp');
  }
}

async function loadTasks() {
  if (!contract || accounts.length === 0) return;

  const tasksList = document.getElementById('tasksList');
  tasksList.innerHTML = '';

  const tasks = await contract.methods.getTasks().call({ from: accounts[0] });

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.textContent = task.description + (task.completed ? ' ✅' : '');

    const delBtn = document.createElement('button');
    delBtn.innerText = 'Delete';
    delBtn.className = 'deleteBtn';
    delBtn.onclick = () => deleteTask(index);

    const toggleBtn = document.createElement('button');
    toggleBtn.innerText = task.completed ? 'Undo' : 'Complete';
    toggleBtn.className = 'toggleBtn';
    toggleBtn.onclick = () => toggleTask(index);
    li.appendChild(toggleBtn);
    li.appendChild(document.createTextNode(' ')); 
    li.appendChild(delBtn);
    tasksList.appendChild(li);
  });
}

async function addTask() {
  if (accounts.length === 0) {
    alert('Connect your wallet first!');
    return;
  }

  const input = document.getElementById('newTask');
  const description = input.value.trim();
  if (!description) {
    alert('Enter a task');
    return;
  }

  try {
    await contract.methods.addTask(description).send({ from: accounts[0] });
    input.value = '';
    loadTasks();
  } catch (error) {
    alert('Error adding task: ' + error.message);
  }
}

async function toggleTask(index) {
    if (accounts.length === 0) {
        alert('Connect your wallet first!');
        return;
    }
    try {
        await contract.methods.toggleTask(index).send({ from: accounts[0] });
        loadTasks();
    } catch (error) {
        alert('Error toggling task: ' + error.message);
    }   
}

async function deleteTask(index) {
  try {
    await contract.methods.deleteTask(index).send({ from: accounts[0] });
    loadTasks();
  } catch (error) {
    alert('Error deleting task: ' + error.message);
  }
}

window.onload = () => {
  document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
  document.getElementById('addTaskBtn').addEventListener('click', addTask);
};
