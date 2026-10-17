export function normalizeText(text) {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFC")
    .toLocaleLowerCase("fa");
}

export function createId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  return node;
}