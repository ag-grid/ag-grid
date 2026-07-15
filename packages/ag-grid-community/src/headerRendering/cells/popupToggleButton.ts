type ButtonListenerRegistrar = (mousedown: () => void, click: (event: MouseEvent) => void) => void;

// A trigger button whose open popup is closed by the document `mousedown` that precedes its `click`. Its own
// `mousedown` runs first and records that the popup was open, so the trailing mouse click is swallowed rather than
// reopening. Only genuine mouse clicks (`detail > 0`) are swallowed: a keyboard/programmatic click (or a stale
// `mousedown` whose click never arrived) has no matching close to swallow, so it toggles the popup directly here.
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
        (event) => {
            const swallowMouseClose = wasShowingOnMouseDown && event.detail > 0;
            wasShowingOnMouseDown = false;
            if (swallowMouseClose) {
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
