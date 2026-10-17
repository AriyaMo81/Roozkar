import { taskError, taskInput } from "./dom.js";

export function showError(message) {
  taskError.textContent = message;
  taskError.hidden = false;
  taskInput.setAttribute("aria-invalid", "true");
}

export function clearError() {
  taskError.textContent = "";
  taskError.hidden = true;
  taskInput.removeAttribute("aria-invalid");
}