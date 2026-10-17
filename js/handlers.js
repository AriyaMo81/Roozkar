import { state, hasDuplicate } from "./state.js";
import { addButton, card, taskError, taskInput, taskList } from "./dom.js";
import { showError, clearError } from "./errors.js";
import { renderTasks } from "./render.js";
import {
  addTask,
  deleteTask,
  clearAllTasks,
  toggleTask,
  startEdit,
  cancelEdit,
  saveEdit,
} from "./actions.js";

function handleListClick(event) {
  // Prevent the label from toggling the checkbox while typing in edit mode.
  if (event.target.closest(".task-text[contenteditable='true']")) {
    event.preventDefault();
    return;
  }

  const button = event.target.closest("button");
  if (!button || !taskList.contains(button)) return;

  const item = button.closest(".task-item");
  const id = item.dataset.id;

  if (button.dataset.action === "delete") {
    deleteTask(id);
  } else if (button.dataset.action === "edit") {
    if (state.editingId === id) {
      saveEdit(id, item.querySelector(".task-text").textContent);
    } else {
      startEdit(id);
    }
  }
}

function handleListChange(event) {
  if (!event.target.matches(".task-checkbox")) return;
  const item = event.target.closest(".task-item");
  item.classList.toggle("is-completed", event.target.checked);
  toggleTask(item.dataset.id, event.target.checked);
}

function handleListKeydown(event) {
  const editor = event.target.closest(".task-text[contenteditable='true']");
  if (!editor) return;

  if (event.key === "Enter") {
    event.preventDefault();
    saveEdit(editor.closest(".task-item").dataset.id, editor.textContent);
  } else if (event.key === "Escape") {
    cancelEdit();
  }
}

function handleTaskInput() {
  const text = taskInput.value.trim();

  if (!text) {
    if (!taskError.hidden) {
      showError("لطفاً عنوان کاری را که می‌خواهید اضافه کنید بنویسید.");
    }
    return;
  }

  if (hasDuplicate(text)) showError("این کار از قبل در فهرست وجود دارد.");
  else clearError();
}

// The search field and "Delete all" button are created dynamically,
// so their events are handled by delegation on the card.
function handleCardInput(event) {
  if (!event.target.matches(".search-input")) return;
  state.query = event.target.value;
  renderTasks();
}

function handleCardClick(event) {
  if (event.target.closest(".clear-all-btn")) clearAllTasks();
}

export function setupEventListeners() {
  addButton.addEventListener("click", addTask);
  taskInput.addEventListener("input", handleTaskInput);
  taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addTask();
  });
  taskList.addEventListener("click", handleListClick);
  taskList.addEventListener("change", handleListChange);
  taskList.addEventListener("keydown", handleListKeydown);
  card.addEventListener("input", handleCardInput);
  card.addEventListener("click", handleCardClick);
}