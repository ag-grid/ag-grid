import type { waitForOptions } from '@testing-library/dom';
import { getByRole, waitFor } from '@testing-library/dom';

/** What the default selector matches: `agLargeTextCellEditor` is a textarea, so this is not just an input.
 *  No grid editor or filter renders a `<select>`, so a caller wanting one passes its own selector. */
export type EditorFormControl = HTMLInputElement | HTMLTextAreaElement;

/**
 * Waits for an input element inside a given container.
 *
 * @param container - The container element (e.g., a div).
 * @param options - Optional waitFor options and CSS selector.
 * @returns A Promise resolving to the found input element.
 */
export async function waitForInput(
    gridDiv: HTMLElement,
    container?: HTMLElement,
    options?: waitForOptions & { selector?: string; popup?: boolean }
): Promise<EditorFormControl> {
    // The 2s default is merged into the caller's options rather than replaced by them, so passing `selector`
    // alone does not silently drop the wait to waitFor's own 1s. `popup` is ours, so it is destructured out.
    const { selector = 'input, textarea', popup, ...rest } = options ?? {};
    const waitOptions: waitForOptions = { timeout: 2000, ...rest };

    if (popup) {
        const dialog = await waitFor(() => getByRole(gridDiv, 'dialog'), waitOptions);
        container = dialog;
    }

    return await waitFor(() => {
        const input = container?.querySelector<EditorFormControl>(selector);
        if (!input) {
            throw new Error(`Input not found in container with selector: "${selector}"`);
        }
        return input;
    }, waitOptions);
}

export async function waitForPopup(gridDiv: HTMLElement, options?: waitForOptions): Promise<HTMLElement> {
    // The check must be inside the callback: waitFor only retries when its callback throws, so
    // returning a null query result resolves on tick 0 and this never actually waits for the popup.
    return await waitFor(() => {
        const dialog = gridDiv.querySelector<HTMLElement>('.ag-popup');
        if (!dialog) {
            throw new Error('Popup dialog not found');
        }
        return dialog;
    }, options);
}

export function fakeElementAttribute<K extends keyof HTMLElement, S extends string>(
    attribute: K,
    value: HTMLElement[K],
    selector: S
): void {
    Object.defineProperty(HTMLElement.prototype, attribute, {
        configurable: true,
        get(this: HTMLElement): HTMLElement[K] {
            return this.matches(selector) ? value : (0 as HTMLElement[K]);
        },
    });
}
