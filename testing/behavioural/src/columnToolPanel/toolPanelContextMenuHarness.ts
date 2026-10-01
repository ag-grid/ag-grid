import { waitFor } from '@testing-library/dom';
import { asyncSetTimeout } from 'ag-test-utils';

/**
 * Locate the tool-panel virtual-list row whose displayName is `label` and return its
 * focus-wrapper element — the element AG Grid registers the `contextmenu` listener on.
 * Virtual lists only render visible items, so if `getComponentAt` returns nothing we
 * materialise a comp via `createComponentFromItem` (same fallback used in
 * deferredPivotModeHarness.ts).
 */
export async function getColumnEntry(toolPanel: any, gridDiv: HTMLElement, label: string): Promise<HTMLElement> {
    const listPanel = toolPanel.primaryColsPanel.primaryColsListPanel;
    const rowIndex = await waitFor(() => {
        const index = (listPanel.getDisplayedColsList() as any[]).findIndex((item) => item.displayName === label);
        if (index < 0) {
            throw new Error(`Tool-panel column entry not found for displayName="${label}"`);
        }
        return index;
    });
    const displayedColsList = listPanel.getDisplayedColsList() as any[];

    listPanel['virtualList'].ensureIndexVisible(rowIndex);
    await asyncSetTimeout(0);

    const rendered = listPanel['virtualList'].getComponentAt(rowIndex) as any;
    if (rendered) {
        const renderedEl = rendered.getGui() as HTMLElement;
        return (renderedEl.closest('.ag-virtual-list-item') as HTMLElement | null) ?? renderedEl;
    }

    // No layout engine, so the virtual list may not have rendered the item: build the comp on a live node.
    const focusWrapper = document.createElement('div');
    focusWrapper.classList.add('ag-virtual-list-item');
    gridDiv.appendChild(focusWrapper);
    const comp = listPanel['createComponentFromItem'](displayedColsList[rowIndex], focusWrapper);
    focusWrapper.appendChild(comp.getGui());
    return focusWrapper;
}

/**
 * Open the tool-panel context menu for the given column. Dispatches a real `contextmenu`
 * MouseEvent on the column entry's focus wrapper — same path AG Grid uses in production.
 * The menu is appended to the popup layer and clickable via `findByText`.
 */
export async function openToolPanelContextMenu(toolPanel: any, gridDiv: HTMLElement, label: string): Promise<void> {
    const entry = await getColumnEntry(toolPanel, gridDiv, label);
    entry.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }));
    // The popup registers its close listeners in a deferred task, so yield one tick to let the
    // menu reach its steady state before the caller reads or clicks it.
    await asyncSetTimeout(0);
}
