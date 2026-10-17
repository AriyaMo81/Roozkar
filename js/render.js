import { state } from "./state.js";
import { taskList } from "./dom.js";
import { el, normalizeText } from "./utils.js";
import { createActionButton } from "./icons.js";
import { mount, unmount } from "./registry.js";
import { createEmptyFilter } from "./components.js";
import { syncChrome } from "./chrome.js";

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

function focusAtEnd(element) {
  element.focus();
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

export function renderTasks() {
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

export function renderAll() {
  syncChrome();
  renderTasks();
}