const STORAGE_KEY = "todo-app:tasks";
const SCHEMA_KEY = "todo-app:schema";
const SCHEMA_VERSION = "2";

// One-time cleanup: wipes old localStorage data on the first run of this
// version, then marks the schema so user data persists on later visits.
function resetStorageOnce() {
  try {
    if (localStorage.getItem(SCHEMA_KEY) !== SCHEMA_VERSION) {
      localStorage.clear();
      localStorage.setItem(SCHEMA_KEY, SCHEMA_VERSION);
    }
  } catch {
    /* storage unavailable (private mode, etc.) */
  }
}

// Runs once when this module is first imported, before state.js reads tasks.
resetStorageOnce();

export function loadTasks() {
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

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* ignore quota / availability errors */
  }
}