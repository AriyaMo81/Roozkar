import { state, hasDuplicate } from "./state.js";
import { saveTasks } from "./storage.js";
import { taskInput, taskList } from "./dom.js";
import { showError, clearError } from "./errors.js";
import { createId } from "./utils.js";
import { renderAll, renderTasks } from "./render.js";
import { updateSummary } from "./chrome.js";

export function addTask() {
  const text = taskInput.value.trim().replace(/\s+/g, " ");

  if (!text) {
    showError("لطفاً عنوان کاری را که می‌خواهید اضافه کنید بنویسید.");
    taskInput.focus();
    return;
  }

  if (hasDuplicate(text)) {
    showError("این کار از قبل در فهرست وجود دارد.");
    taskInput.focus();
    return;
  }

  clearError();
  state.tasks.push({ id: createId(), text, completed: false });
  saveTasks(state.tasks);
  taskInput.value = "";
  renderAll();
  taskInput.focus();
}

export function deleteTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  if (state.editingId === id) state.editingId = null;
  if (state.tasks.length === 0) state.query = "";
  saveTasks(state.tasks);
  renderAll();
}

export function clearAllTasks() {
  state.tasks = [];
  state.query = "";
  state.editingId = null;
  saveTasks(state.tasks);
  clearError();
  renderAll();
}

export function toggleTask(id, completed) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = completed;
  saveTasks(state.tasks);
  updateSummary();
}

export function startEdit(id) {
  clearError();
  state.editingId = id;
  renderTasks();
}

export function cancelEdit() {
  state.editingId = null;
  clearError();
  renderTasks();
}

export function saveEdit(id, rawText) {
  const text = rawText.trim().replace(/\s+/g, " ");
  const editor = taskList.querySelector(".task-text[contenteditable='true']");

  if (!text) {
    showError("عنوان کار نمی‌تواند خالی باشد.");
    editor?.focus();
    return;
  }

  if (hasDuplicate(text, id)) {
    showError("این کار از قبل در فهرست وجود دارد.");
    editor?.focus();
    return;
  }

  const task = state.tasks.find((t) => t.id === id);
  if (task) task.text = text;
  state.editingId = null;
  saveTasks(state.tasks);
  clearError();
  renderTasks();
}