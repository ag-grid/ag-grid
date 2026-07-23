import type { LocaleTextFunc } from 'ag-stack';

import type { IconName } from 'ag-grid-community';

interface ToggleTokenLabels {
    addKey: string;
    addDefault: (displayName: string) => string;
    removeKey: string;
    removeDefault: (displayName: string) => string;
    icon: IconName;
}

interface ActionTokenLabels {
    key: string;
    default: (displayName: string) => string;
    icon: IconName;
}

// Shared locale keys, default text, and icons for the cross-surface column menu tokens, so the column
// menu (MenuItemMapper) and the Columns Tool Panel / Column Chooser menu (ToolPanelContextMenu) cannot drift.
export const VALUE_TOKEN: ToggleTokenLabels = {
    addKey: 'addToValues',
    addDefault: (displayName) => `Add ${displayName} to values`,
    removeKey: 'removeFromValues',
    removeDefault: (displayName) => `Remove ${displayName} from values`,
    icon: 'valuePanel',
};

export const PIVOT_TOKEN: ToggleTokenLabels = {
    addKey: 'addToLabels',
    addDefault: (displayName) => `Add ${displayName} to labels`,
    removeKey: 'removeFromLabels',
    removeDefault: (displayName) => `Remove ${displayName} from labels`,
    icon: 'pivotPanel',
};

export const SCROLL_INTO_VIEW_TOKEN: ActionTokenLabels = {
    key: 'scrollColumnIntoView',
    default: (displayName) => `Scroll ${displayName} into View`,
    icon: 'ensureColumnVisible',
};

export function columnMenuTokenLabel(
    localeTextFunc: LocaleTextFunc,
    key: string,
    defaultText: (displayName: string) => string,
    displayName: string
): string {
    return localeTextFunc(key, defaultText(displayName), [displayName]);
}
