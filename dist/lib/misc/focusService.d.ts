// Type definitions for ag-grid v5.0.7
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
export declare class FocusService {
    private gridCore;
    private columnController;
    private destroyMethods;
    private listeners;
    addListener(listener: (focusEvent: FocusEvent) => void): void;
    removeListener(listener: (focusEvent: FocusEvent) => void): void;
    private init();
    private getCellForFocus(focusEvent);
    private informListeners(event);
    private destroy();
}
