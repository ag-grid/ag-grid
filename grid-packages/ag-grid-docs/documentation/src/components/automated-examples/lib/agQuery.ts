import {
    AG_COLUMN_SELECT_LABEL_SELECTOR,
    AG_GROUP_CONTRACTED,
    AG_GROUP_EXPANDED,
    AG_HEADER_CELL_SELECTOR,
    AG_HEADER_CELL_TEXT_SELECTOR,
    AG_SIDEBAR_BUTTON_LABEL_SELECTOR,
} from './constants';
import { findElementWithInnerText, getBoundingClientRectMidpoint } from './dom';
import { Point } from './geometry';

const SIDEBAR_TOOL_PANEL_LABEL_KEY_TEXT = {
    columns: 'Columns',
    filters: 'Filters',
};

type SidebarToolPanelLabelKey = keyof typeof SIDEBAR_TOOL_PANEL_LABEL_KEY_TEXT;

export function getCell({
    containerEl = document.body,
    colIndex,
    rowIndex,
}: {
    containerEl?: HTMLElement;
    colIndex: number;
    rowIndex: number;
}): HTMLElement | undefined {
    const rowEl = containerEl.querySelector(`div[row-index="${rowIndex}"]`);
    if (!rowEl) {
        return;
    }

    const cellEl = rowEl.children[colIndex] as HTMLElement;
    if (!cellEl) {
        return;
    }

    return cellEl;
}

export function getCellPos({
    containerEl,
    colIndex,
    rowIndex,
}: {
    containerEl?: HTMLElement;
    colIndex: number;
    rowIndex: number;
}): Point | undefined {
    const cellEl = getCell({ containerEl, colIndex, rowIndex });
    if (!cellEl) {
        return;
    }

    return getBoundingClientRectMidpoint(cellEl);
}

export function getGroupCellTogglePos({
    containerEl,
    colIndex,
    rowIndex,
}: {
    containerEl?: HTMLElement;
    colIndex: number;
    rowIndex: number;
}): Point | undefined {
    const cellEl = getCell({ containerEl, colIndex, rowIndex });
    if (!cellEl) {
        return;
    }
    const contractedEl = cellEl.querySelector(`${AG_GROUP_CONTRACTED}:not(.ag-hidden)`);
    const expandedEl = cellEl.querySelector(`${AG_GROUP_EXPANDED}:not(.ag-hidden)`);
    const toggleEl = (contractedEl || expandedEl) as HTMLElement;

    return toggleEl ? getBoundingClientRectMidpoint(toggleEl) : undefined;
}

export function getSidebarToolPanelButtonPos({
    containerEl,
    key,
}: {
    containerEl?: HTMLElement;
    key: SidebarToolPanelLabelKey;
}): Point | undefined {
    const el = findElementWithInnerText({
        containerEl,
        selector: AG_SIDEBAR_BUTTON_LABEL_SELECTOR,
        text: SIDEBAR_TOOL_PANEL_LABEL_KEY_TEXT[key],
    });

    if (!el) {
        return;
    }

    return getBoundingClientRectMidpoint(el);
}

export function getSidebarColumnInputPos({
    containerEl,
    columnText,
}: {
    containerEl?: HTMLElement;
    columnText: string;
}): Point | undefined {
    const el = findElementWithInnerText({
        containerEl,
        selector: AG_COLUMN_SELECT_LABEL_SELECTOR,
        text: columnText,
    });

    if (!el) {
        return;
    }

    return getBoundingClientRectMidpoint(el);
}

export function getHeaderCellPos({
    containerEl,
    headerCellText,
}: {
    containerEl?: HTMLElement;
    headerCellText: string;
}): Point | undefined {
    const el = findElementWithInnerText({
        containerEl,
        selector: AG_HEADER_CELL_TEXT_SELECTOR,
        text: headerCellText,
    });

    if (!el) {
        return;
    }

    return getBoundingClientRectMidpoint(el);
}

export function getHeaderCell({
    containerEl,
    headerCellText,
}: {
    containerEl?: HTMLElement;
    headerCellText: string;
}): HTMLElement | undefined {
    // Get inner text label element
    const headerTextElem = findElementWithInnerText({
        containerEl,
        selector: AG_HEADER_CELL_TEXT_SELECTOR,
        text: headerCellText,
    });

    if (!headerTextElem) {
        console.error(`No header cell for: ${headerCellText}`);
        return;
    }

    // Get parent header cell element
    const parentHeader = headerTextElem.closest(AG_HEADER_CELL_SELECTOR) as HTMLElement;
    return parentHeader ?? undefined;
}
