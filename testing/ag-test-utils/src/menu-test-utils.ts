import { waitFor } from '@testing-library/dom';

/**
 * happy-dom has no layout engine, so `HTMLElement.offsetParent` is always null and AG Grid's
 * visibility/focus-management code treats popups (menus) as hidden. Polyfill it so menus render
 * and behave. Returns a restore function to call in `afterEach`.
 */
export function polyfillOffsetParent(): () => void {
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        configurable: true,
        get(this: HTMLElement) {
            return this.closest('.ag-measurement-container') ? null : this.parentElement;
        },
    });
    return () => {
        if (original) {
            Object.defineProperty(HTMLElement.prototype, 'offsetParent', original);
        } else {
            delete (HTMLElement.prototype as any).offsetParent;
        }
    };
}

/** The rendered menu option element with the given visible text, or `null` if not present. */
export function menuOption(name: string): HTMLElement | null {
    return (
        Array.from(document.querySelectorAll<HTMLElement>('.ag-menu-option-text')).find(
            (el) => el.textContent?.trim() === name
        ) ?? null
    );
}

/** Wait until the menu option with the given text is rendered, then return it. */
export function openMenuOption(name: string): Promise<HTMLElement> {
    return waitFor(() => {
        const option = menuOption(name);
        if (!option) {
            throw new Error(`Menu option not found: ${name}`);
        }
        return option;
    });
}

/** Wait for the menu option with the given text, then click the `.ag-menu-option` row carrying it. */
export async function clickMenuOption(name: string): Promise<void> {
    (await openMenuOption(name)).closest<HTMLElement>('.ag-menu-option')!.click();
}
