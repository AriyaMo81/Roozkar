import { loadTasks } from "./storage.js";
import { normalizeText } from "./utils.js";

export const state = {
  tasks: loadTasks(),
  query: "",
  editingId: null,
};

export function hasDuplicate(text, excludedId = null) {
  const normalized = normalizeText(text);
  return state.tasks.some(
    (task) => task.id !== excludedId && normalizeText(task.text) === normalized,
  );
}