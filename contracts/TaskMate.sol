// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

contract TaskMate {
    uint public constant MAX_TASKS = 50;

    struct Task {
        uint id;
        string content;
        bool status;
    }

    mapping(address => Task[]) private tasks;

    // Events to log task creation, update, toggle, and deletion
    event TaskCreated(uint id, string content, address indexed creator);
    event TaskEdited(uint id, string content, address indexed updater);
    event TaskToggled(uint id, string content, bool status, address indexed sender);
    event TaskDeleted(uint id, address indexed deleter);

    // Create a new task for the sender
    function createTask(string memory _content) public {
        require(bytes(_content).length > 0, "Task content cannot be empty");
        require(tasks[msg.sender].length < MAX_TASKS, "Maximum task limit reached");

        uint newId = tasks[msg.sender].length; // ID is index in array
        tasks[msg.sender].push(Task(newId, _content, false));

        emit TaskCreated(newId, _content, msg.sender);
    }

    // Edit a task by id for the sender
    function editTask(uint _id, string memory _content) public {
        require(_id < tasks[msg.sender].length, "Invalid task ID");
        require(bytes(_content).length > 0, "Task content cannot be empty");

        Task storage task = tasks[msg.sender][_id];
        task.content = _content;

        emit TaskEdited(_id, _content, msg.sender);
    }

    // Toggle task status by id for the sender
    function toggleTaskStatus(uint _id) public {
        require(_id < tasks[msg.sender].length, "Invalid task ID");

        Task storage task = tasks[msg.sender][_id];
        task.status = !task.status;

        emit TaskToggled(_id, task.content, task.status, msg.sender);
    }

    
    function deleteTask(uint _id) public {
        require(_id < tasks[msg.sender].length, "Invalid task ID");

        uint lastIndex = tasks[msg.sender].length - 1;

        if (_id != lastIndex) {
            
            tasks[msg.sender][_id] = tasks[msg.sender][lastIndex];
            tasks[msg.sender][_id].id = _id; 
        }

        tasks[msg.sender].pop();

        emit TaskDeleted(_id, msg.sender);
    }

    function clearTasks() public {
        delete tasks[msg.sender];
    }

    function getTasks() public view returns (Task[] memory) {
        return tasks[msg.sender];
    }

    function getTaskCount() public view returns (uint) {
        return tasks[msg.sender].length;
    }
}
