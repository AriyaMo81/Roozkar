import { el } from "./utils.js";

const ICON_PATHS = {
  edit: "m14 5 5 5M4 20l4.5-1 10.2-10.2a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z",
  save: "m5 12 4 4L19 6",
  delete: "M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3",
};

function createIcon(action) {
  const ns = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(ns, "svg");
  const path = document.createElementNS(ns, "path");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  path.setAttribute("d", ICON_PATHS[action]);
  icon.append(path);
  return icon;
}

export function createActionButton(action, label) {
  const button = el("button", `${action === "save" ? "edit" : action}-button`, {
    type: "button",
    "aria-label": label,
  });
  button.dataset.action = action === "save" ? "edit" : action;
  button.append(createIcon(action));
  return button;
}