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
    container: HTMLElement,
    options?: waitForOptions & { selector?: string; popup?: boolean }
): Promise<HTMLInputElement> {
    const { selector = 'input, select, textarea', ...waitOptions } = options ?? { timeout: 2000 };

    if (options?.popup) {
        const dialog = await waitFor(() => getByRole(gridDiv, 'dialog'), waitOptions);
        container = dialog;
    }

    return await waitFor(() => {
        const input = container.querySelector<HTMLInputElement>(selector);
        if (!input) {
            throw new Error(`Input not found in container with selector: "${selector}"`);
        }
        return input;
    }, waitOptions);
}
