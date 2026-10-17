import { state } from "./state.js";
import { card, cardHeading, taskList, appMain } from "./dom.js";
import { ui, mount, unmount } from "./registry.js";
import {
  createCountBadge,
  createToolbar,
  createFooter,
  createHint,
} from "./components.js";

const persianNumber = new Intl.NumberFormat("fa-IR");

export function updateSummary() {
  if (!ui.badge || !ui.footer) return;
  const total = state.tasks.length;
  const remaining = state.tasks.filter((t) => !t.completed).length;

  ui.badge.textContent = persianNumber.format(total);
  ui.badge.setAttribute("aria-label", `${persianNumber.format(total)} کار`);
  ui.footer.querySelector(".remaining-count").textContent =
    `${persianNumber.format(remaining)} کار باقی‌مانده`;
}

// Mounts or unmounts the conditional UI depending on whether tasks exist.
export function syncChrome() {
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