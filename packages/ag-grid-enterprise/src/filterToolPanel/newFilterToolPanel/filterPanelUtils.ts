import { _removeFromParent, _translate } from 'ag-grid-community';
import type { BeanStub } from 'ag-grid-community';

const DEFAULT_LOCALE_TEXT = {
    addFilterCard: 'Add Filter',
    ariaLabelAddFilterField: 'Add Filter Field',
    ariaLabelFilterCardDelete: 'Delete Filter',
    ariaLabelFilterCardHasEdits: 'Has Edits',
    agTextColumnFilterDisplayName: 'Text Filter',
    agNumberColumnFilterDisplayName: 'Number Filter',
    agDateColumnFilterDisplayName: 'Date Filter',
    agSetColumnFilterDisplayName: 'Set Filter',
    agMultiColumnFilterDisplayName: 'Multi Filter',
    addFilterPlaceholder: 'Search columns...',
} as const;

export function translateForFilterPanel(bean: BeanStub<any>, key: keyof typeof DEFAULT_LOCALE_TEXT): string {
    return _translate(bean, DEFAULT_LOCALE_TEXT, key);
}

export function compareAndUpdateListsInDom(
    eContainer: HTMLElement,
    eNewItems: HTMLElement[],
    ePrevItems: HTMLElement[]
): void {
    let newIndex = 0;
    for (let prevIndex = 0; prevIndex < ePrevItems.length; prevIndex++) {
        const ePrevItem = ePrevItems[prevIndex];
        if (ePrevItem === eNewItems[newIndex]) {
            newIndex++;
        } else {
            _removeFromParent(ePrevItem);
        }
    }

    while (newIndex < eNewItems.length) {
        eContainer.appendChild(eNewItems[newIndex++]);
    }
}
