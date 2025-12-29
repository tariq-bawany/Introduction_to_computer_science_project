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
    .addEventListener("keypress", function (e) {
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
function isDuplicateTask(taskText, excludeId = null) {
  const normalizedText = taskText.toLowerCase().trim();
  return tasks.some(
    (t) => t.text.toLowerCase().trim() === normalizedText && t.id !== excludeId
  );
}

// Add Task
function addTask() {
  const taskInput = document.getElementById("taskInput");
  const categorySelect = document.getElementById("categorySelect");
  const deadlineInput = document.getElementById("deadlineInput");

  const taskText = taskInput.value.trim();
  const deadline = deadlineInput.value;

  // Validate required fields
  if (!taskText) {
    alert("⚠️ Task name is required! Please enter a task.");
    taskInput.focus();
    return;
  }

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
    id: generateId(),
    text: taskText,
    category: categorySelect.value,
    deadline: deadline,
    completed: false,
  };

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
function formatDeadline(deadline) {
  if (!deadline) return "";
  const date = new Date(deadline);
  const options = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("en-US", options);
}

// Check if deadline is overdue
function isOverdue(deadline) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

// Create Task HTML
function createTaskHTML(task) {
  const deadlineClass =
    !task.completed && isOverdue(task.deadline) ? "overdue" : "";
  const deadlineText = task.deadline ? formatDeadline(task.deadline) : "";

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
                            ${
                              deadlineText
                                ? `<span class="task-deadline ${deadlineClass}">&#128197; ${deadlineText}</span>`
                                : ""
                            }
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

// Escape HTML to prevent XSS
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Render Tasks
function renderTasks() {
  const activeTasks = tasks.filter((t) => !t.completed);
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
    activeList.innerHTML = activeTasks.map(createTaskHTML).join("");
  }

  // Render completed tasks
  if (completedTasks.length === 0) {
    completedList.innerHTML =
      '<li class="empty-state">No completed tasks yet.</li>';
  } else {
    completedList.innerHTML = completedTasks.map(createTaskHTML).join("");
  }
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

// Load tasks from localStorage
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
