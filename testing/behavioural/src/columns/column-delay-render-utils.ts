const HIDE_CLASS = 'ag-delay-render';

export interface HideClassRecorder {
    /** Writes of the hide class so far, in order: `'add'` when it was set, `'remove'` when cleared. */
    readonly events: string[];
    stop: () => void;
}

/**
 * Records when the grid becomes hidden and revealed. The hide window opens and closes during grid
 * creation, so the class is gone by the time a test can look at the DOM — without a record of the
 * writes, "never hidden" and "hidden then revealed" are indistinguishable.
 *
 * Intercepting `DOMTokenList` rather than observing the DOM is not a stylistic choice: both the hide
 * and the reveal land while `eGridBody` is still detached, so a `MutationObserver` rooted at the
 * document sees neither. The API call is the only observable at that point.
 *
 * Every `DOMTokenList` mutator is covered, so the source is free to write the class however it likes.
 */
export function recordHideClassMutations(): HideClassRecorder {
    const events: string[] = [];
    const { add, remove, toggle } = DOMTokenList.prototype;

    DOMTokenList.prototype.add = function recordAdd(...tokens: string[]) {
        if (tokens.includes(HIDE_CLASS)) {
            events.push('add');
        }
        return add.apply(this, tokens);
    };
    DOMTokenList.prototype.remove = function recordRemove(...tokens: string[]) {
        if (tokens.includes(HIDE_CLASS)) {
            events.push('remove');
        }
        return remove.apply(this, tokens);
    };
    DOMTokenList.prototype.toggle = function recordToggle(token: string, force?: boolean) {
        const result = toggle.call(this, token, force);
        if (token === HIDE_CLASS) {
            events.push(result ? 'add' : 'remove');
        }
        return result;
    };

    return {
        events,
        stop: () => {
            DOMTokenList.prototype.add = add;
            DOMTokenList.prototype.remove = remove;
            DOMTokenList.prototype.toggle = toggle;
        },
    };
}

export function isHidden(): boolean {
    return !!document.querySelector(`.${HIDE_CLASS}`);
}
