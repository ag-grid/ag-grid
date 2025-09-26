import type { waitForOptions } from '@testing-library/dom';
import { getByRole, waitFor } from '@testing-library/dom';

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
): Promise<HTMLInputElement> {
    const { selector = 'input, select, textarea', ...waitOptions } = options ?? { timeout: 2000 };

    if (options?.popup) {
        const dialog = await waitFor(() => getByRole(gridDiv, 'dialog'), waitOptions);
        container = dialog;
    }

    return await waitFor(() => {
        const input = container?.querySelector<HTMLInputElement>(selector);
        if (!input) {
            throw new Error(`Input not found in container with selector: "${selector}"`);
        }
        return input;
    }, waitOptions);
}

export async function waitForPopup(gridDiv: HTMLElement, options?: waitForOptions): Promise<HTMLElement> {
    const dialog = await waitFor(() => gridDiv.querySelector('.ag-popup') as HTMLElement, options);
    if (!dialog) {
        throw new Error('Popup dialog not found');
    }
    return dialog!;
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
