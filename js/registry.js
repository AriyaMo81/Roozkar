// Keeps track of UI pieces that exist only when needed.
export const ui = {};

export function mount(name, create, place) {
  if (!ui[name]) {
    ui[name] = create();
    place(ui[name]);
  }
  return ui[name];
}

export function unmount(name) {
  if (ui[name]) {
    ui[name].remove();
    delete ui[name];
  }
}