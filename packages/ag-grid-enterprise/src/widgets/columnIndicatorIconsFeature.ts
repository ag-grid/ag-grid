import { _setDisplayed } from 'ag-stack';

import type { AgColumn, ColumnIndicatorIcon } from 'ag-grid-community';
import { BeanStub, _createElement, _createIconNoSpan } from 'ag-grid-community';

/** Shows the indicator icons that modules supply for a column, before and after its name, outside the header. */
export class ColumnIndicatorIconsFeature extends BeanStub {
    private eLastAfter: Element;
    private readonly shownAfter = new Set<HTMLElement>();

    constructor(
        private readonly column: AgColumn,
        private readonly eName: HTMLElement
    ) {
        super();
        this.eLastAfter = eName;
    }

    public postConstruct(): void {
        const { calculatedColsSvc, showValuesAsSvc } = this.beans;
        for (const icon of [calculatedColsSvc?.indicatorIcon, showValuesAsSvc?.indicatorIcon]) {
            if (icon) {
                this.addIcon(icon);
            }
        }
    }

    private addIcon(icon: ColumnIndicatorIcon): void {
        const { column, eName } = this;
        const eIcon = this.createIcon(icon);
        if (icon.position === 'before') {
            eName.before(eIcon);
        } else {
            this.eLastAfter.after(eIcon);
            this.eLastAfter = eIcon;
        }

        const refresh = () => {
            const show = icon.refresh(column, eIcon);
            _setDisplayed(eIcon, show, { skipAriaHidden: true });
            if (icon.position === 'after') {
                if (show) {
                    this.shownAfter.add(eIcon);
                } else {
                    this.shownAfter.delete(eIcon);
                }
                eName.classList.toggle('ag-column-indicator-name', this.shownAfter.size > 0);
            }
        };
        icon.addRefreshListeners(this, column, refresh);
        refresh();
    }

    private createIcon({ iconName, cls }: ColumnIndicatorIcon): HTMLElement {
        const eIcon = _createElement({
            tag: 'span',
            cls: `ag-column-indicator-icon ${cls}`,
            attrs: { 'aria-hidden': 'true' },
        });
        const eIconContent = _createIconNoSpan(iconName, this.beans, this.column);
        if (eIconContent) {
            eIcon.appendChild(eIconContent);
        }
        return eIcon;
    }
}
