const contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138';

let web3;
let contract;
let accounts = [];

async function connectWallet() {
  const providerChoice = document.getElementById('providerSelect').value;

  if (providerChoice === 'metamask') {
    if (window.ethereum) {
      try {
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        web3 = new web3(window.ethereum);
        document.getElementById('wallet-status').innerText = `Connected (MetaMask): ${accounts[0]}`;
      } catch (error) {
        alert('MetaMask connection denied');
        return;
      }
    } else {
      alert('MetaMask not detected. Please install MetaMask.');
      return;
    }
  } else if (providerChoice === 'ganache') {
    try {
      web3 = new web3('http://127.0.0.1:7545');
      accounts = await web3.eth.getAccounts();
      document.getElementById('wallet-status').innerText = `Connected (Ganache): ${accounts[0]}`;
    } catch (error) {
      alert('Failed to connect to Ganache. Is it running on http://127.0.0.1:7545?');
      return;
    }
  }

  const response = await fetch('/TaskMate-DApp/abi.json');
  const abi = await response.json();
  contract = new web3.eth.Contract(abi, contractAddress);

  loadTasks();

  if (providerChoice === 'metamask') {
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

    window.ethereum.on('chainChanged', () => window.location.reload());
  }

  document.getElementById('connectWalletBtn').disabled = true;
}

async function loadTasks() {
  if (!contract || accounts.length === 0) return;

  const tasksList = document.getElementById('tasksList');
  tasksList.innerHTML = '';

  const tasks = await contract.methods.getTasks().call({ from: accounts[0] });

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.textContent = task.description +' : '+ (task.completed ? 'Done' : 'Pending');

    const delBtn = document.createElement('button');
    delBtn.innerText = 'Delete';
    delBtn.className = 'deleteBtn';
    delBtn.onclick = () => deleteTask(index);

    const toggleBtn = document.createElement('button');
    toggleBtn.innerText = task.completed ? 'Undo' : 'Completed';
    toggleBtn.className = 'toggleBtn';
    toggleBtn.onclick = () => toggleTask(index);

    li.appendChild(toggleBtn);
    li.appendChild(document.createTextNode(' '));
    li.appendChild(delBtn);
    tasksList.appendChild(li);
  });
}

async function addTask() {
  if (accounts.length === 0) return alert('Connect your wallet first!');

  const input = document.getElementById('newTask');
  const description = input.value.trim();
  if (!description) return alert('Enter a task');

  try {
    await contract.methods.createTask(description).send({ from: accounts[0] });
    input.value = '';
    loadTasks();
  } catch (error) {
    alert('Error adding task: ' + error.message);
  }
}

async function editTask(index) {
  if (accounts.length === 0) return alert('Connect your wallet first!');

  const newDescription = prompt('Enter new task description:');
  if (!newDescription) return;

  try {
    await contract.methods.editTask(index, newDescription).send({ from: accounts[0] });
    loadTasks();
  } catch (error) {
    alert('Error editing task: ' + error.message);
  }
}
async function toggleTask(index) {
  if (accounts.length === 0) return alert('Connect your wallet first!');
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

async function clearTask() {
  if (accounts.length === 0) return alert('Connect your wallet first!');

  try {
    await contract.methods.clearTasks().send({ from: accounts[0] });
    loadTasks();
  } catch (error) {
    alert('Error clearing tasks: ' + error.message);
  }
}

window.onload = () => {
    document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    document.getElementById('clearTasksBtn').addEventListener('click', clearTask);
    document.getElementById('editTaskBtn').addEventListener('click', () => {
        const index = prompt('Enter task index to edit:');
        if (index !== null) {
            editTask(parseInt(index));
        }
    });
};
