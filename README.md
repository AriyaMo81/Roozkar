# Roozkar

A responsive Persian RTL to-do list app with JavaScript-powered task management.

## Features

- Add, edit, delete, and complete tasks (inline editing: Enter to save, Esc to cancel)
- Live search that appears only when at least one task exists
- "Delete all" button that appears only when at least one task exists
- Persistent storage via `localStorage`
- Duplicate and empty-input validation with accessible error messages
- No default tasks: the list starts empty
- Keyboard support, ARIA labels, and reduced-motion support

## Getting started

No build step or dependencies are required.

```bash
# Option 1: open index.html directly in a browser

# Option 2: serve locally
npx serve .
# or
python3 -m http.server 8000
```

## Project structure

```
.
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── docs/
│   └── implementation-notes.md
└── README.md
```

## Project notes

For the implementation order, design decisions, and a guide to the main JavaScript functions, see [Implementation notes](docs/implementation-notes.md).

## Resetting data

Open the browser console and run:

```js
localStorage.clear();
location.reload();
```

## License

MIT