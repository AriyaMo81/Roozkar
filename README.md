# Roozkar

A responsive Persian RTL to-do list app with JavaScript-powered task management, built with plain HTML, CSS, and ES modules. No frameworks or build tools.

## Features

- Add, edit, delete, and complete tasks (inline editing: Enter to save, Esc to cancel)
- Live search that appears only when at least one task exists
- "Delete all" button that appears only when at least one task exists
- Persistent storage via `localStorage`
- Duplicate and empty-input validation with accessible error messages
- No default tasks: the list starts empty
- Keyboard support, ARIA labels, and reduced-motion support

## Getting started

No build step or dependencies are required, but the app must be served over HTTP.
Browsers block ES modules on `file://`, so opening `index.html` directly will not work.

```bash
# Option 1: Node
npx serve .

# Option 2: Python
python3 -m http.server 8000
```

Then open the printed address (for example `http://localhost:8000`).

## Project structure

```
.
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js          # Entry point
│   ├── utils.js        # Generic helpers
│   ├── storage.js      # localStorage access
│   ├── state.js        # App state and duplicate check
│   ├── dom.js          # Static DOM references
│   ├── errors.js       # Validation messages
│   ├── icons.js        # SVG icons and action buttons
│   ├── registry.js     # Mount/unmount of dynamic UI
│   ├── components.js   # Factories for dynamic elements
│   ├── chrome.js       # Shows/hides conditional UI, updates counters
│   ├── render.js       # Renders the task list
│   ├── actions.js      # Add, edit, delete, toggle, clear
│   └── handlers.js     # Event handlers and listener setup
├── docs/
│   └── implementation-notes.md
└── README.md
```

## Architecture

Dependencies only point "downwards", so there are no circular imports:

```
handlers.js → actions.js → render.js → chrome.js / components.js
                  ↓             ↓
          state.js + storage.js (data)
```

1. **Foundation:** `utils.js`, `storage.js`, `dom.js`, `registry.js`
2. **Data and UI helpers:** `state.js`, `errors.js`, `icons.js`, `components.js`
3. **Display:** `chrome.js`, `render.js`
4. **Behavior:** `actions.js`, `handlers.js`
5. **Entry:** `app.js`

## Function guide

### `app.js`

| Function | Purpose |
| --- | --- |
| `init()` | Registers all event listeners and performs the first render. |

### `utils.js`

| Function | Purpose |
| --- | --- |
| `normalizeText(text)` | Trims, collapses whitespace, normalizes (NFC), and lowercases text for duplicate checks and search. |
| `createId()` | Returns a unique task ID (`crypto.randomUUID` with a fallback). |
| `el(tag, className, attrs)` | Small DOM factory that creates an element with a class and attributes (`text` sets `textContent`). |

### `storage.js`

| Function | Purpose |
| --- | --- |
| `resetStorageOnce()` | Clears `localStorage` once when the stored schema version differs from `SCHEMA_VERSION`, then saves the version. Runs automatically when the module is first imported. |
| `loadTasks()` | Reads and validates tasks from storage. Returns `[]` on any failure. |
| `saveTasks(tasks)` | Saves the given task array to storage. Errors are ignored safely. |

### `state.js`

| Export | Purpose |
| --- | --- |
| `state` | The single source of truth: `tasks`, `query` (search text), and `editingId` (task being edited). |
| `hasDuplicate(text, excludedId)` | Checks whether a task with the same normalized title exists, optionally ignoring one task (used while editing). |

### `dom.js`

| Export | Purpose |
| --- | --- |
| `card`, `cardHeading`, `taskInput`, `addButton`, `taskError`, `taskList`, `appMain` | References to the static elements of the page, queried once. |

### `errors.js`

| Function | Purpose |
| --- | --- |
| `showError(message)` | Shows the validation message and sets `aria-invalid` on the input. |
| `clearError()` | Hides the message and removes `aria-invalid`. |

### `icons.js`

| Function | Purpose |
| --- | --- |
| `createIcon(action)` | Internal. Builds the SVG icon for `edit`, `save`, or `delete`. |
| `createActionButton(action, label)` | Builds an accessible icon button (edit, save, or delete) with an `aria-label`. |

### `registry.js`

| Export | Purpose |
| --- | --- |
| `ui` | Object that tracks which dynamic UI pieces currently exist. |
| `mount(name, create, place)` | Creates a UI piece once, places it in the DOM, and registers it. |
| `unmount(name)` | Removes a UI piece from the DOM and the registry. |

### `components.js`

| Function | Purpose |
| --- | --- |
| `createCountBadge()` | Creates the total-tasks counter. |
| `createToolbar()` | Creates the search field. |
| `createFooter()` | Creates the footer with the remaining-tasks label and the "Delete all" button. |
| `createHint()` | Creates the start hint shown when the list is empty. |
| `createEmptyFilter()` | Creates the "no matching task" message. |

These functions only build elements. Their events are handled by delegation in `handlers.js`.

### `chrome.js`

| Function | Purpose |
| --- | --- |
| `updateSummary()` | Refreshes the total counter and the remaining-tasks label. |
| `syncChrome()` | Mounts the counter, search, and footer when tasks exist. Otherwise removes them and shows the start hint. |

### `render.js`

| Function | Purpose |
| --- | --- |
| `createTaskItem(task)` | Internal. Builds one `<li>` including checkbox, text, buttons, and editing state. |
| `focusAtEnd(element)` | Internal. Focuses an editable element and moves the caret to the end. |
| `renderTasks()` | Applies the search query, renders the visible tasks, and handles the empty-filter message and editor focus. |
| `renderAll()` | Runs `syncChrome()` and then `renderTasks()`. |

### `actions.js`

| Function | Purpose |
| --- | --- |
| `addTask()` | Validates the input (empty or duplicate), adds the task, saves, and re-renders. |
| `deleteTask(id)` | Removes one task and resets the search when the list becomes empty. |
| `clearAllTasks()` | Removes every task, resets search and edit state, saves, and re-renders. |
| `toggleTask(id, completed)` | Updates a task's completion state, saves, and refreshes the counters. |
| `startEdit(id)` | Switches a task into edit mode. |
| `cancelEdit()` | Leaves edit mode without saving. |
| `saveEdit(id, rawText)` | Validates the new title (empty or duplicate), saves it, and leaves edit mode. |

### `handlers.js`

| Function | Purpose |
| --- | --- |
| `handleListClick(event)` | Handles the edit, save, and delete buttons. Blocks label clicks inside the editor so the checkbox is not toggled. |
| `handleListChange(event)` | Handles checkbox changes. |
| `handleListKeydown(event)` | While editing: Enter saves and Esc cancels. |
| `handleTaskInput()` | Live validation (empty or duplicate) while typing a new task. |
| `handleCardInput(event)` | Handles typing in the dynamically created search field. |
| `handleCardClick(event)` | Handles clicks on the dynamically created "Delete all" button. |
| `setupEventListeners()` | Registers all listeners. |

## Project notes

For the implementation order and design decisions, see [Implementation notes](docs/implementation-notes.md).

## Resetting data

Open the browser console and run:

```js
localStorage.clear();
location.reload();
```

## License

MIT