export function removeFocus() {
    (document.activeElement as HTMLElement).blur();
}
