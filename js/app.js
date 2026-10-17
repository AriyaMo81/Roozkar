import { setupEventListeners } from "./handlers.js";
import { renderAll } from "./render.js";

function init() {
  setupEventListeners();
  renderAll();
}

init();