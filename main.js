// Task storage

// tasks is an arrays of object that stores objects in array , objects include key : id, text,category,deadline,completed
let tasks = [];
let editingTaskId = null;

// Category mappings
const categoryLabels = {
  study: "&#128218; Study",
  assignment: "&#128221; Assignment",
  project: "&#128188; Project",
  exam: "&#128214; Exam Prep",
  lab: "&#128300; Lab Work",
  reading: "&#128213; Reading",
  other: "&#128204; Other",
};

const categoryClasses = {
  study: "cat-study",
  assignment: "cat-assignment",
  project: "cat-project",
  exam: "cat-exam",
  lab: "cat-lab",
  reading: "cat-reading",
  other: "cat-other",
};

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  loadTasks();
  renderTasks();

  // Add enter key support
  document
    .getElementById("taskInput")
    .addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        addTask();
      }
    });
});

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Check for duplicate task
//  it is called 2 times , one in addTask function, second in EditTask function
//  in addTask function --> the task from input is checked from the arrays of objects for an existing task , and at this point the  excludeId= null
//  in editTask function --> the task is checked and the task id is the editing id that is passed as excludeId and we exclude this by t.id !== excludeId
function isDuplicateTask(taskText, excludeId = null) {
  const normalizedText = taskText.toLowerCase();
  return tasks.some(
    (t) => t.text.toLowerCase() === normalizedText && t.id !== excludeId
  );
}

// Add Task
// the input validation that inputs are not empty || duplication check that no duplicate entries are done
function addTask() {
  const taskInput = document.getElementById("taskInput");
  const categorySelect = document.getElementById("categorySelect");
  const deadlineInput = document.getElementById("deadlineInput");

  const taskText = taskInput.value.trim();
  const deadline = deadlineInput.value;

  // Validate required fields
  // if the tasktext input value is empty after trimming spaces it will alert the message
  if (!taskText) {
    alert("⚠️ Task name is required! Please enter a task.");
    taskInput.focus();
    return;
  }

  // if the deadline input value is empty after trimming spaces it will alert the message
  if (!deadline) {
    alert("⚠️ Deadline is required! Please select a deadline.");
    deadlineInput.focus();
    return;
  }

  // Check for duplicate task
  if (isDuplicateTask(taskText)) {
    alert(
      "⚠️ Duplicate task! This task already exists. Please enter a different task."
    );
    taskInput.focus();
    taskInput.select();
    return;
  }

  const task = {
    id: generateId(), // id will generated through function generateId()
    text: taskText, // taskInput value after trimming starting and ending spaces
    category: categorySelect.value, // category select value from input section
    deadline: deadline, // deadline input value from input section
    completed: false, // all tasks are incompleted at intial.
  };

  console.log(tasks);

  tasks.push(task);
  saveTasks();
  renderTasks();
  clearInputs();
}

// Clear Inputs
function clearInputs() {
  document.getElementById("taskInput").value = "";
  document.getElementById("categorySelect").value = "study";
  document.getElementById("deadlineInput").value = "";
  document.getElementById("taskInput").focus();
}

// Toggle Task Completion
function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

// Delete Task
function deleteTask(id) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    renderTasks();
  }
}

// Delete All Active Tasks
function deleteAllActive() {
  const activeTasks = tasks.filter((t) => !t.completed);
  if (activeTasks.length === 0) {
    alert("No active tasks to delete!");
    return;
  }
  if (confirm("Delete all active tasks?")) {
    tasks = tasks.filter((t) => t.completed);
    saveTasks();
    renderTasks();
  }
}

// Delete All Completed Tasks
function deleteAllCompleted() {
  const completedTasks = tasks.filter((t) => t.completed);
  if (completedTasks.length === 0) {
    alert("No completed tasks to delete!");
    return;
  }
  if (confirm("Delete all completed tasks?")) {
    tasks = tasks.filter((t) => !t.completed);
    saveTasks();
    renderTasks();
  }
}

// Open Edit Modal
function openEditModal(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    editingTaskId = id;
    document.getElementById("editTaskInput").value = task.text;
    document.getElementById("editCategorySelect").value = task.category;
    document.getElementById("editDeadlineInput").value = task.deadline;
    document.getElementById("editModal").classList.add("active");
  }
}

// Close Edit Modal
function closeEditModal() {
  editingTaskId = null;
  document.getElementById("editModal").classList.remove("active");
}

// Save Edit
function saveEdit() {
  const task = tasks.find((t) => t.id === editingTaskId);
  if (task) {
    const newText = document.getElementById("editTaskInput").value.trim();
    const newDeadline = document.getElementById("editDeadlineInput").value;

    // Validate required fields
    if (!newText) {
      alert("⚠️ Task name is required! Please enter a task.");
      document.getElementById("editTaskInput").focus();
      return;
    }

    if (!newDeadline) {
      alert("⚠️ Deadline is required! Please select a deadline.");
      document.getElementById("editDeadlineInput").focus();
      return;
    }

    // Check for duplicate task (excluding current task)
    if (isDuplicateTask(newText, editingTaskId)) {
      alert(
        "⚠️ Duplicate task! This task already exists. Please enter a different task."
      );
      document.getElementById("editTaskInput").focus();
      document.getElementById("editTaskInput").select();
      return;
    }

    task.text = newText;
    task.category = document.getElementById("editCategorySelect").value;
    task.deadline = newDeadline;
    saveTasks();
    renderTasks();
    closeEditModal();
  }
}
// Format Deadline
// A date string, e.g., "2025-12-30T14:30:00"
// A JavaScript Date object
// A timestamp (milliseconds since Jan 1, 1970)
// Return Value:
// A formatted string showing the date and time, e.g., "Dec 30, 02:30 PM".
function formatDeadline(deadline) {
  const date = new Date(deadline);
  const options = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("en-US", options);
}

// Check if deadline is overdue , returns true or false only 
// if deadline has passed returns false , if deadline has not passed returns true
function isOverdue(deadline) {
  return new Date(deadline) < new Date();
}

// Create Task HTML
function createTaskHTML(task) {
  const deadlineClass =
    !task.completed && isOverdue(task.deadline) ? "overdue" : "";
  const deadlineText = formatDeadline(task.deadline);

  return `
                <li class="task-item" data-id="${task.id}">
                    <input type="checkbox" class="task-checkbox" 
                        ${task.completed ? "checked" : ""} 
                        onchange="toggleTask('${task.id}')" />
                    <div class="task-content">
                        <div class="task-text">${escapeHTML(task.text)}</div>
                        <div class="task-meta">
                            <span class="task-category ${
                              categoryClasses[task.category]
                            }">
                                ${categoryLabels[task.category]}
                            </span>
                            <span class="task-deadline ${deadlineClass}">&#128197; ${deadlineText}</span>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="btn-action btn-edit" onclick="openEditModal('${
                          task.id
                        }')" title="Edit">&#9999;&#65039;</button>
                        <button class="btn-action btn-delete" onclick="deleteTask('${
                          task.id
                        }')" title="Delete">&#128465;&#65039;</button>
                    </div>
                </li>
            `;
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Render Tasks
function renderTasks() {
  // will create a new arrays of object for all tasks that has false value for the completed key.
  const activeTasks = tasks.filter((t) => !t.completed);

  // will create a new arrays of object for all tasks that has true value for the completed key.
  const completedTasks = tasks.filter((t) => t.completed);

  const activeList = document.getElementById("activeTasksList");
  const completedList = document.getElementById("completedTasksList");

  // Update counts
  document.getElementById("activeCount").textContent = activeTasks.length;
  document.getElementById("completedCount").textContent = completedTasks.length;

  // Render active tasks
  if (activeTasks.length === 0) {
    activeList.innerHTML =
      '<li class="empty-state">No active tasks. Add one above!</li>';
  } else {
    activeList.innerHTML = "";
    activeTasks.forEach((task) => {
      activeList.innerHTML += createTaskHTML(task);
    });
  }

  // Render completed tasks
  if (completedTasks.length === 0) {
    completedList.innerHTML =
      '<li class="empty-state">No completed tasks yet.</li>';
  } else {
    completedList.innerHTML = "";
    completedTasks.forEach((task) => {
      completedList.innerHTML += createTaskHTML(task);
    });
  }
}

// Save tasks to localStorage // Cache Memory of the browser
function saveTasks() {
  localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

// Load tasks from localStorage //  Cacher Memory
function loadTasks() {
  const saved = localStorage.getItem("todoTasks");
  if (saved) {
    tasks = JSON.parse(saved);
  }
}

// Close modal when clicking outside
document.getElementById("editModal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeEditModal();
  }
});

// Keyboard shortcut to close modal
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeEditModal();
  }
});