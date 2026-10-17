import { el } from "./utils.js";
import { state } from "./state.js";

// Pure element factories. Their events are handled by delegation in handlers.js.

export function createCountBadge() {
  return el("span", "task-count");
}

export function createToolbar() {
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
  label.append(hidden, input);
  toolbar.append(label);
  return toolbar;
}

export function createFooter() {
  const footer = el("div", "card-footer");
  const remaining = el("span", "remaining-count");
  const clearAll = el("button", "clear-all-btn", {
    type: "button",
    text: "حذف همه",
  });
  footer.append(remaining, clearAll);
  return footer;
}

export function createHint() {
  return el("p", "footer-note", {
    text: "برای شروع، اولین کار امروزت را بنویس.",
  });
}

export function createEmptyFilter() {
  return el("p", "empty-filter-state", { text: "هیچ کار منطبقی پیدا نشد." });
}