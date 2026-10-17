"use strict";

/* ---------- Storage ---------- */

const STORAGE_KEY = "todo-app:tasks";
const SCHEMA_KEY = "todo-app:schema";
const SCHEMA_VERSION = "2";

// One-time cleanup: wipes old localStorage data on the first run of this
// version, then marks the schema so user data persists on later visits.
(function resetStorageOnce() {
  try {
    if (localStorage.getItem(SCHEMA_KEY) !== SCHEMA_VERSION) {
      localStorage.clear();
      localStorage.setItem(SCHEMA_KEY, SCHEMA_VERSION);
    }
  } catch {
    /* storage unavailable (private mode, etc.) */
  }
})();

function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (t) => t && typeof t.id === "string" && typeof t.text === "string",
      )
      .map((t) => ({
        id: t.id,
        text: t.text,
        completed: Boolean(t.completed),
      }));
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  } catch {
    /* ignore quota / availability errors */
  }
}

/* ---------- State & DOM references ---------- */

const state = {
  tasks: loadTasks(),
  query: "",
  editingId: null,
};

const card = document.querySelector(".todo-card");
const cardHeading = document.querySelector(".card-heading");
const taskInput = document.querySelector("#new-task");
const addButton = document.querySelector(".add-button");
const taskError = document.querySelector("#task-error");
const taskList = document.querySelector(".task-list");
const appMain = document.querySelector(".app");

const persianNumber = new Intl.NumberFormat("fa-IR");

/* ---------- Helpers ---------- */

function normalizeText(text) {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFC")
    .toLocaleLowerCase("fa");
}

function createId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  return node;
}

const ICON_PATHS = {
  edit: "m14 5 5 5M4 20l4.5-1 10.2-10.2a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z",
  save: "m5 12 4 4L19 6",
  delete: "M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3",
};

function createIcon(action) {
  const ns = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(ns, "svg");
  const path = document.createElementNS(ns, "path");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  path.setAttribute("d", ICON_PATHS[action]);
  icon.append(path);
  return icon;
}

function createActionButton(action, label) {
  const button = el("button", `${action === "save" ? "edit" : action}-button`, {
    type: "button",
    "aria-label": label,
  });
  button.dataset.action = action === "save" ? "edit" : action;
  button.append(createIcon(action));
  return button;
}

function hasDuplicate(text, excludedId = null) {
  const normalized = normalizeText(text);
  return state.tasks.some(
    (task) => task.id !== excludedId && normalizeText(task.text) === normalized,
  );
}

/* ---------- Errors ---------- */

function showError(message) {
  taskError.textContent = message;
  taskError.hidden = false;
  taskInput.setAttribute("aria-invalid", "true");
}

function clearError() {
  taskError.textContent = "";
  taskError.hidden = true;
  taskInput.removeAttribute("aria-invalid");
}

/* ---------- Dynamic UI (exists only when needed) ---------- */

const ui = {};

function mount(name, create, place) {
  if (!ui[name]) {
    ui[name] = create();
    place(ui[name]);
  }
  return ui[name];
}

function unmount(name) {
  if (ui[name]) {
    ui[name].remove();
    delete ui[name];
  }
}

function createCountBadge() {
  return el("span", "task-count");
}

function createToolbar() {
  const toolbar = el("div", "toolbar");
  const label = el("label", "search-field", { for: "task-search" });
  const hidden = el("span", "visually-hidden", { text: "جست‌وجو" });
  const input = el("input", "search-input", {
    id: "task-search",
    type: "search",
    placeholder: "جست‌وجو در کارها...",
    autocomplete: "off",
  });
  input.value = state.query;
  input.addEventListener("input", () => {
    state.query = input.value;
    renderTasks();
  });
  label.append(hidden, input);
  toolbar.append(label);
  return toolbar;
}

function createFooter() {
  const footer = el("div", "card-footer");
  const remaining = el("span", "remaining-count");
  const clearAll = el("button", "clear-all-btn", {
    type: "button",
    text: "حذف همه",
  });
  clearAll.addEventListener("click", clearAllTasks);
  footer.append(remaining, clearAll);
  return footer;
}

function createHint() {
  return el("p", "footer-note", {
    text: "برای شروع، اولین کار امروزت را بنویس.",
  });
}

function createEmptyFilter() {
  return el("p", "empty-filter-state", { text: "هیچ کار منطبقی پیدا نشد." });
}

function syncChrome() {
  const hasTasks = state.tasks.length > 0;

  if (hasTasks) {
    mount("badge", createCountBadge, (n) => cardHeading.append(n));
    mount("toolbar", createToolbar, (n) => taskList.before(n));
    mount("footer", createFooter, (n) => card.append(n));
    unmount("hint");
    updateSummary();
  } else {
    unmount("badge");
    unmount("toolbar");
    unmount("footer");
    unmount("emptyFilter");
    mount("hint", createHint, (n) => appMain.append(n));
  }
}

function updateSummary() {
  if (!ui.badge || !ui.footer) return;
  const total = state.tasks.length;
  const remaining = state.tasks.filter((t) => !t.completed).length;

  ui.badge.textContent = persianNumber.format(total);
  ui.badge.setAttribute("aria-label", `${persianNumber.format(total)} کار`);
  ui.footer.querySelector(".remaining-count").textContent =
    `${persianNumber.format(remaining)} کار باقی‌مانده`;
}

/* ---------- Rendering ---------- */

function createTaskItem(task) {
  const isEditing = state.editingId === task.id;

  const item = el(
    "li",
    `task-item${task.completed ? " is-completed" : ""}${isEditing ? " is-editing" : ""}`,
  );
  item.dataset.id = task.id;

  const label = el("label", "task-label");
  const checkbox = el("input", "task-checkbox", { type: "checkbox" });
  checkbox.checked = task.completed;
  const custom = el("span", "custom-checkbox", { "aria-hidden": "true" });
  const text = el("span", "task-text", { text: task.text });

  if (isEditing) {
    text.contentEditable = "true";
    text.setAttribute("role", "textbox");
    text.setAttribute("aria-label", "عنوان جدید کار");
  }

  const actions = el("div", "task-actions");
  actions.append(
    isEditing
      ? createActionButton("save", "ذخیره تغییرات")
      : createActionButton("edit", `ویرایش ${task.text}`),
    createActionButton("delete", `حذف ${task.text}`),
  );

  label.append(checkbox, custom, text);
  item.append(label, actions);
  return item;
}

function renderTasks() {
  const query = normalizeText(state.query);
  const visible = query
    ? state.tasks.filter((t) => normalizeText(t.text).includes(query))
    : state.tasks;

  taskList.replaceChildren(...visible.map(createTaskItem));

  if (state.tasks.length > 0 && visible.length === 0) {
    mount("emptyFilter", createEmptyFilter, (n) => taskList.after(n));
  } else {
    unmount("emptyFilter");
  }

  const editor = taskList.querySelector(".task-text[contenteditable='true']");
  if (editor) focusAtEnd(editor);
}

function focusAtEnd(element) {
  element.focus();
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function renderAll() {
  syncChrome();
  renderTasks();
}

/* ---------- Actions ---------- */

function addTask() {
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
  saveTasks();
  taskInput.value = "";
  renderAll();
  taskInput.focus();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  if (state.editingId === id) state.editingId = null;
  if (state.tasks.length === 0) state.query = "";
  saveTasks();
  renderAll();
}

function clearAllTasks() {
  state.tasks = [];
  state.query = "";
  state.editingId = null;
  saveTasks();
  clearError();
  renderAll();
}

function toggleTask(id, completed) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = completed;
  saveTasks();
  updateSummary();
}

function startEdit(id) {
  clearError();
  state.editingId = id;
  renderTasks();
}

function cancelEdit() {
  state.editingId = null;
  clearError();
  renderTasks();
}

function saveEdit(id, rawText) {
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
  saveTasks();
  clearError();
  renderTasks();
}

/* ---------- Event handlers ---------- */

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

function init() {
  addButton.addEventListener("click", addTask);
  taskInput.addEventListener("input", handleTaskInput);
  taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addTask();
  });
  taskList.addEventListener("click", handleListClick);
  taskList.addEventListener("change", handleListChange);
  taskList.addEventListener("keydown", handleListKeydown);

  renderAll();
}

init();
