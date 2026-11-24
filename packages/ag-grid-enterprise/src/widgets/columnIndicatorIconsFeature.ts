import { _setDisplayed } from 'ag-stack';

import type { AgColumn, IconName } from 'ag-grid-community';
import { BeanStub, _createElement, _createIconNoSpan } from 'ag-grid-community';

/** Shows the column header's type indicators next to a column's name outside the header: ƒx before it, Show Values As after it. */
export class ColumnIndicatorIconsFeature extends BeanStub {
    private eCalculatedColumn: HTMLElement | null = null;
    private eShowValuesAs: HTMLElement | null = null;

    constructor(
        private readonly column: AgColumn,
        private readonly eName: HTMLElement
    ) {
        super();
    }

    public postConstruct(): void {
        const { column, eName } = this;
        if (this.beans.showValuesAsSvc) {
            const eShowValuesAs = this.createIcon('showValuesAs', 'ag-show-values-as-icon');
            this.eShowValuesAs = eShowValuesAs;
            eName.after(eShowValuesAs);
            this.addManagedListeners(column, { columnStateUpdated: this.refreshShowValuesAs.bind(this) });
            this.addManagedEventListeners({
                columnRowGroupChanged: this.refreshShowValuesAs.bind(this),
                columnPivotChanged: this.refreshShowValuesAs.bind(this),
                columnPivotModeChanged: this.refreshShowValuesAs.bind(this),
            });
        }
        this.addManagedListeners(column, { colDefChanged: this.refresh.bind(this) });
        this.refresh();
    }

    public override destroy(): void {
        this.eCalculatedColumn?.remove();
        this.eShowValuesAs?.remove();
        super.destroy();
    }

    private refresh(): void {
        this.refreshCalculatedColumn();
        this.refreshShowValuesAs();
    }

    private refreshCalculatedColumn(): void {
        const show = this.column.isCalculatedCol;
        if (show && !this.eCalculatedColumn) {
            this.eCalculatedColumn = this.createIcon('calculatedColumnsHeader', 'ag-calculated-column-icon');
            this.eName.before(this.eCalculatedColumn);
        } else if (!show && this.eCalculatedColumn) {
            this.eCalculatedColumn.remove();
            this.eCalculatedColumn = null;
        }
    }

    private refreshShowValuesAs(): void {
        const { eShowValuesAs, column } = this;
        const showValuesAsSvc = this.beans.showValuesAsSvc;
        if (!eShowValuesAs || !showValuesAsSvc) {
            return;
        }
        const show = showValuesAsSvc.isIndicatorShown(column);
        _setDisplayed(eShowValuesAs, show, { skipAriaHidden: true });
        if (show) {
            eShowValuesAs.classList.toggle('ag-show-values-as-dormant', !showValuesAsSvc.isApplying(column));
            eShowValuesAs.title = showValuesAsSvc.getActiveModeTooltip(column) ?? '';
        }
    }

    private createIcon(iconName: IconName, cls: string): HTMLElement {
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
