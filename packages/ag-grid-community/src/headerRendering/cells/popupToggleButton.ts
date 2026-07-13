type ButtonListenerRegistrar = (mousedown: () => void, click: () => void) => void;

// A trigger button whose open popup closes on the document `mousedown` that precedes the button's `click`.
// The button's own `mousedown` fires first, so the open state captured there survives the close and lets the
// trailing mouse click be swallowed instead of reopening. Keyboard activation produces a `click` with no
// `mousedown` and no document-close, so that path is toggled closed explicitly here.
export function _addPopupToggleButtonListeners(
    registerListeners: ButtonListenerRegistrar,
    isShowing: () => boolean,
    open: () => void,
    close: () => void
): void {
    let wasShowingOnMouseDown = false;
    registerListeners(
        () => {
            wasShowingOnMouseDown = isShowing();
        },
        () => {
            if (wasShowingOnMouseDown) {
                wasShowingOnMouseDown = false;
                return;
            }
            if (isShowing()) {
                close();
                return;
            }
            open();
        }
    );
}
