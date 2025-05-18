document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskList = document.getElementById("taskList");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const clearCompletedBtn = document.getElementById("clearCompleted");
  const taskCount = document.getElementById("taskCount");
  const currentDate = document.getElementById("currentDate");
  const emptyState = document.querySelector(".empty-state");
  const notification = document.getElementById("notification");
  const notificationText = document.getElementById("notificationText");
  const themeToggle = document.getElementById("themeToggle");

  // State
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let currentFilter = "all";

  // Initialize
  updateDate();
  renderTasks();
  updateTaskCount();
  checkEmptyState();

  // Event Listeners
  addTaskBtn.addEventListener("click", addTask);
  taskInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") addTask();
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      filterBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      currentFilter = this.dataset.filter;
      renderTasks();
    });
  });

  clearCompletedBtn.addEventListener("click", clearCompletedTasks);
  themeToggle.addEventListener("click", toggleTheme);

  // Check for saved theme preference
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  // Functions
  function updateDate() {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const today = new Date();
    currentDate.textContent = today.toLocaleDateString("en-US", options);
  }

  function addTask() {
    const text = taskInput.value.trim();
    if (text === "") {
      showNotification("Please enter a task", "warning");
      return;
    }

    const newTask = {
      id: Date.now(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = "";
    updateTaskCount();
    checkEmptyState();
    showNotification("Task added successfully!", "success");
    animateAddTask(newTask.id);
  }

  function renderTasks() {
    taskList.innerHTML = "";

    let filteredTasks = [];

    switch (currentFilter) {
      case "active":
        filteredTasks = tasks.filter((task) => !task.completed);
        break;
      case "completed":
        filteredTasks = tasks.filter((task) => task.completed);
        break;
      default:
        filteredTasks = [...tasks];
    }

    if (filteredTasks.length === 0) {
      showEmptyState();
      return;
    }

    filteredTasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = `task ${task.completed ? "completed" : ""}`;
      taskElement.dataset.id = task.id;

      taskElement.innerHTML = `
                        <div class="task-check">
                            <i class="fas fa-check"></i>
                        </div>
                        <div class="task-text">${task.text}</div>
                        <div class="task-actions">
                            <button class="task-btn edit"><i class="fas fa-edit"></i></button>
                            <button class="task-btn delete"><i class="fas fa-trash"></i></button>
                        </div>
                    `;

      taskList.appendChild(taskElement);

      // Add event listeners to the new elements
      const checkBtn = taskElement.querySelector(".task-check");
      const editBtn = taskElement.querySelector(".edit");
      const deleteBtn = taskElement.querySelector(".delete");

      checkBtn.addEventListener("click", () => toggleTaskComplete(task.id));
      editBtn.addEventListener("click", () => editTask(task.id));
      deleteBtn.addEventListener("click", () => deleteTask(task.id));
    });
  }

  function toggleTaskComplete(id) {
    const taskIndex = tasks.findIndex((task) => task.id == id);
    if (taskIndex === -1) return;

    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    saveTasks();
    renderTasks();
    updateTaskCount();

    if (tasks[taskIndex].completed) {
      showNotification("Task completed!", "success");
      createConfetti();
    }
  }

  function editTask(id) {
    const task = tasks.find((task) => task.id == id);
    if (!task) return;

    const taskElement = document.querySelector(`.task[data-id="${id}"]`);
    const taskTextElement = taskElement.querySelector(".task-text");

    const currentText = task.text;
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.className = "edit-input";
    input.style.cssText = `
                    flex: 1;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 1rem;
                    outline: none;
                `;

    taskTextElement.innerHTML = "";
    taskTextElement.appendChild(input);
    input.focus();

    function saveEdit() {
      const newText = input.value.trim();
      if (newText === "") {
        deleteTask(id);
        return;
      }

      task.text = newText;
      saveTasks();
      renderTasks();
      showNotification("Task updated!", "info");
    }

    input.addEventListener("blur", saveEdit);
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") saveEdit();
    });
  }

  function deleteTask(id) {
    tasks = tasks.filter((task) => task.id != id);
    saveTasks();
    renderTasks();
    updateTaskCount();
    checkEmptyState();
    showNotification("Task deleted", "danger");

    // Animation for deletion
    const taskElement = document.querySelector(`.task[data-id="${id}"]`);
    if (taskElement) {
      taskElement.style.transform = "translateX(-100%)";
      taskElement.style.opacity = "0";
      setTimeout(() => {
        renderTasks();
      }, 300);
    }
  }

  function clearCompletedTasks() {
    if (!tasks.some((task) => task.completed)) {
      showNotification("No completed tasks to clear", "warning");
      return;
    }

    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    renderTasks();
    updateTaskCount();
    checkEmptyState();
    showNotification("Completed tasks cleared", "info");
  }

  function addSampleTasks() {
    const sampleTasks = [
      {
        id: Date.now(),
        text: "Complete project presentation",
        completed: false,
      },
      { id: Date.now() + 1, text: "Buy groceries", completed: false },
      { id: Date.now() + 2, text: "Go for a run", completed: false },
      {
        id: Date.now() + 3,
        text: "Read 30 pages of book",
        completed: true,
      },
      { id: Date.now() + 4, text: "Call mom", completed: false },
    ];

    tasks = [...sampleTasks, ...tasks];
    saveTasks();
    renderTasks();
    updateTaskCount();
    checkEmptyState();
    showNotification("Sample tasks added!", "success");
  }

  function showEmptyState() {
    if (
      tasks.length === 0 ||
      (currentFilter === "active" && !tasks.some((task) => !task.completed)) ||
      (currentFilter === "completed" && !tasks.some((task) => task.completed))
    ) {
      let message = "";
      let buttonVisible = true;

      if (tasks.length === 0) {
        message = "No tasks yet<br>Add your first task to get started!";
      } else if (currentFilter === "active") {
        message = "No active tasks<br>You've completed everything!";
        buttonVisible = false;
      } else if (currentFilter === "completed") {
        message = "No completed tasks yet<br>Keep going!";
        buttonVisible = false;
      }

      emptyState.innerHTML = `
                        <i class="fas fa-tasks"></i>
                        <p>${message.split("<br>")[0]}</p>
                        <p>${message.split("<br>")[1]}</p>
                        ${
                          buttonVisible
                            ? '<button id="addSampleTaskBtn">Add Sample Task</button>'
                            : ""
                        }
                    `;

      taskList.appendChild(emptyState);

      // Only add event listener if button exists
      const sampleBtn = document.getElementById("addSampleTaskBtn");
      if (sampleBtn) {
        sampleBtn.addEventListener("click", addSampleTasks);
      }
    }
  }

  function checkEmptyState() {
    if (
      (currentFilter === "all" && tasks.length === 0) ||
      (currentFilter === "active" && !tasks.some((task) => !task.completed)) ||
      (currentFilter === "completed" && !tasks.some((task) => task.completed))
    ) {
      showEmptyState();
    }
  }

  function updateTaskCount() {
    const activeTasks = tasks.filter((task) => !task.completed).length;
    const totalTasks = tasks.length;

    if (currentFilter === "all") {
      taskCount.textContent = `${activeTasks} active of ${totalTasks} tasks`;
    } else if (currentFilter === "active") {
      taskCount.textContent = `${activeTasks} active tasks`;
    } else {
      const completedTasks = tasks.filter((task) => task.completed).length;
      taskCount.textContent = `${completedTasks} completed tasks`;
    }
  }

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function showNotification(message, type) {
    notificationText.textContent = message;
    notification.className = "notification";

    // Set color based on type
    switch (type) {
      case "success":
        notification.style.backgroundColor = "var(--success)";
        break;
      case "warning":
        notification.style.backgroundColor = "var(--warning)";
        break;
      case "danger":
        notification.style.backgroundColor = "var(--danger)";
        break;
      case "info":
        notification.style.backgroundColor = "var(--info)";
        break;
      default:
        notification.style.backgroundColor = "var(--primary)";
    }

    notification.classList.add("show");

    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  function animateAddTask(id) {
    const taskElement = document.querySelector(`.task[data-id="${id}"]`);
    if (taskElement) {
      taskElement.style.transform = "scale(0.9)";
      taskElement.style.opacity = "0";

      setTimeout(() => {
        taskElement.style.transition = "all 0.3s ease";
        taskElement.style.transform = "scale(1)";
        taskElement.style.opacity = "1";
      }, 10);
    }
  }

  function createConfetti() {
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";

      // Random properties
      const size = Math.random() * 10 + 5;
      const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
      const left = Math.random() * 100;
      const animationDuration = Math.random() * 3 + 2;

      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      confetti.style.backgroundColor = color;
      confetti.style.left = `${left}%`;
      confetti.style.animationDuration = `${animationDuration}s`;

      document.body.appendChild(confetti);

      // Remove after animation
      setTimeout(() => {
        confetti.remove();
      }, animationDuration * 1000);
    }
  }

  function toggleTheme() {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("darkMode", "enabled");
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      localStorage.setItem("darkMode", "disabled");
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
  }
});
