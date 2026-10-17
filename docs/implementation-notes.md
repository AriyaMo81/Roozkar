# Implementation Notes

This document describes how Roozkar was built, why certain decisions were made,
and what each main function in `js/app.js` does.

## 1. Implementation order

1. **Static shell.** `index.html` contains only what is always visible: the page
   header, the card heading, the add-task input and button, the error message
   slot, and an empty `<ul class="task-list">`.
2. **Styling.** `css/style.css` defines design tokens (CSS variables), the card
   layout, task items, custom checkbox, action buttons, and responsive rules.
3. **Core task logic.** Add, delete, and toggle tasks, with validation for empty
   and duplicate titles.
4. **Inline editing.** Edit mode via `contenteditable`, with save (Enter or the
   save button) and cancel (Esc).
5. **State-driven refactor.** DOM-based lookups were replaced by a single `state`
   object with stable task IDs. The DOM is rendered from that state.
6. **Persistence.** `localStorage` read on startup and written after every change.
7. **Conditional UI.** Counter, search, "Delete all", and the remaining-tasks
   label were removed from the HTML and are now mounted by JavaScript only when
   tasks exist.
8. **Search.** Live filtering by task title.
9. **Storage cleanup.** A one-time `localStorage` reset guarded by a schema version.

## 2. Design decisions

| Decision | Reason |
| --- | --- |
| **No default tasks** | The app starts empty; the user decides what appears. |
| **Dynamic UI lives in JavaScript, not HTML** | Elements that depend on data (counter, search, delete-all, empty-filter message) should not exist in the DOM when they have nothing to act on. |
| **Single source of truth (`state`)** | `state.tasks`, `state.query`, and `state.editingId` fully describe the UI, which makes rendering predictable. |
| **Stable IDs (`crypto.randomUUID`)** | Edit, delete, and toggle target tasks by ID instead of by DOM position or text. |
| **Save on every mutation** | `saveTasks()` runs after add, edit, toggle, delete, and clear-all, so storage never drifts from the UI. |
| **Event delegation** | One listener each for click, change, and keydown on the list, so re-rendering never requires re-binding handlers. |
| **Text normalization for duplicates and search** | Whitespace is collapsed and text is NFC-normalized and lowercased (`fa` locale) so comparisons are consistent. |
| **Versioned one-time reset** | `todo-app:schema` stores a version. If it differs from `SCHEMA_VERSION`, storage is cleared once. Bump the constant to force another reset. |
| **Defensive storage access** | All `localStorage` calls are wrapped in `try/catch` (private mode, quota errors), and loaded data is validated before use. |
| **Accessibility** | Visually hidden labels, `aria-label` on icon buttons, `role="alert"` on errors, `:focus-visible` styles, and `prefers-reduced-motion` support. |

## 3. Data model

Stored under `todo-app:tasks`:

```json
[{ "id": "uuid", "text": "Buy milk", "completed": false }]
```

## 4. Function guide (`js/app.js`)

### Storage

| Function | Purpose |
| --- | --- |
| `resetStorageOnce()` | Runs once at load. Clears `localStorage` if the stored schema version differs from `SCHEMA_VERSION`, then saves the new version. |
| `loadTasks()` | Reads and validates tasks from storage. Returns `[]` on any failure. |
| `saveTasks()` | Serializes `state.tasks` to storage. Errors are swallowed safely. |

### Helpers

| Function | Purpose |
| --- | --- |
| `normalizeText(text)` | Trims, collapses whitespace, normalizes, and lowercases text for comparison and search. |
| `createId()` | Returns a unique ID (`crypto.randomUUID` with a fallback). |
| `el(tag, className, attrs)` | Small DOM factory for creating elements. |
| `createIcon(action)` / `createActionButton(action, label)` | Build the SVG icon and the edit, save, and delete buttons. |
| `hasDuplicate(text, excludedId)` | Checks for an existing task with the same normalized title, optionally ignoring one task (used while editing). |
| `showError(message)` / `clearError()` | Show or hide the validation message and toggle `aria-invalid` on the input. |

### Conditional UI

| Function | Purpose |
| --- | --- |
| `mount(name, create, place)` | Creates a UI piece once, places it in the DOM, and registers it in `ui`. |
| `unmount(name)` | Removes a UI piece and unregisters it. |
| `createCountBadge()`, `createToolbar()`, `createFooter()`, `createHint()`, `createEmptyFilter()` | Factories for the counter, search field, footer (remaining count and "Delete all"), start hint, and "no match" message. |
| `syncChrome()` | Mounts or unmounts the conditional UI depending on whether any tasks exist. |
| `updateSummary()` | Refreshes the total counter and the remaining-tasks label. |

### Rendering

| Function | Purpose |
| --- | --- |
| `createTaskItem(task)` | Builds one `<li>`, including the editing state. |
| `renderTasks()` | Applies the search query, renders the visible tasks, and handles the empty-filter message and editor focus. |
| `focusAtEnd(element)` | Focuses an editable element and moves the caret to the end. |
| `renderAll()` | `syncChrome()` followed by `renderTasks()`. |

### Actions

| Function | Purpose |
| --- | --- |
| `addTask()` | Validates input, appends a task, saves, and re-renders. |
| `deleteTask(id)` | Removes one task. Resets the search query when the list becomes empty. |
| `clearAllTasks()` | Removes every task, resets query and edit state, saves, and re-renders. |
| `toggleTask(id, completed)` | Updates completion state, saves, and refreshes the summary. |
| `startEdit(id)` / `cancelEdit()` / `saveEdit(id, rawText)` | Control inline editing. `saveEdit` validates empty and duplicate titles before saving. |

### Event handlers

| Function | Purpose |
| --- | --- |
| `handleListClick(event)` | Delegated handler for edit, save, and delete buttons. Also prevents clicks inside the editor from toggling the checkbox. |
| `handleListChange(event)` | Delegated handler for checkbox changes. |
| `handleListKeydown(event)` | Enter saves and Escape cancels while editing. |
| `handleTaskInput()` | Live validation (duplicate or empty) while typing a new task. |
| `init()` | Registers all listeners and performs the first render. |

## 5. Extending the app

- **New field on tasks** (for example, a due date): add it to the data model,
  `loadTasks()` validation, `createTaskItem()`, and bump `SCHEMA_VERSION` if old
  data should be discarded.
- **Completion filter** (all, done, pending): add `state.filter`, apply it in
  `renderTasks()`, and mount the control inside `createToolbar()`.
- **Drag-to-reorder**: reorder `state.tasks`, then call `saveTasks()` and `renderTasks()`.