import { _removeFromParent } from 'ag-grid-community';
import type { BeanStub } from 'ag-grid-community';

const DEFAULT_LOCALE_TEXT = {
    addFilterCard: 'Add Filter',
    ariaLabelDeleteFilterCard: 'Delete Filter',
} as const;

type FilterPanelLocaleText = typeof DEFAULT_LOCALE_TEXT;

export function translateForFilterPanel(bean: BeanStub<any>, key: keyof FilterPanelLocaleText): string {
    return bean.getLocaleTextFunc()(key, DEFAULT_LOCALE_TEXT[key]);
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
