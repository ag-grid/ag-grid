/**
 * Manages the cursor styling for an element. Tracks the requested styling from distinct
 * dependents and handles conflicting styling requests.
 */
export declare class CursorManager {
    private readonly states;
    private readonly element;
    constructor(element: HTMLElement);
    updateCursor(callerId: string, style?: string): void;
    private applyStates;
    getCursor(): string;
}
