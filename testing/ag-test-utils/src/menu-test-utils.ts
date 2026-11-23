import { waitFor } from '@testing-library/dom';

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

/** The entries of the open menu in order: each option's text, or `'separator'`. */
export function openMenuEntries(): string[] {
    return Array.from(document.querySelectorAll<HTMLElement>('.ag-menu-option, .ag-menu-separator')).map((el) =>
        el.classList.contains('ag-menu-separator')
            ? 'separator'
            : (el.querySelector<HTMLElement>('.ag-menu-option-text')?.textContent?.trim() ?? '')
    );
}
