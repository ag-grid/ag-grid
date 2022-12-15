interface CursorState {
    style: string;
}

/**
 * Manages the cursor styling for an element. Tracks the requested styling from distinct
 * dependents and handles conflicting styling requests.
 */
export class CursorManager {
    private readonly states: Record<string, CursorState> = {};
    private readonly element: HTMLElement;

    public constructor(element: HTMLElement) {
        this.element = element;
    }

    public updateCursor(callerId: string, style?: string) {
        delete this.states[callerId];

        if (style != null) {
            this.states[callerId] = { style };
        }

        this.applyStates();
    }

    private applyStates() {
        let styleToApply = 'default';

        // Last added entry wins.
        Object.entries(this.states)
            .reverse()
            .slice(0, 1)
            .forEach(([_, { style }]) => (styleToApply = style));

        this.element.style.cursor = styleToApply;
    }
}
