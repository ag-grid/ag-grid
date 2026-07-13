import { _camelCaseToHumanText } from 'ag-stack';

import type { AgColumn, ColKey, ColumnEventType, IColumnHeaderEditService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { ColumnHeaderEditPopup } from './columnHeaderEditPopup';

// Prefill with the raw editable name rather than getDisplayNameForColumn, so opening the editor does not invoke headerValueGetter.
function getEditableHeaderName(column: AgColumn): string {
    const { colDef } = column;
    const name = column.headerNameOverride ?? colDef.headerName ?? (colDef.field ? _camelCaseToHumanText(colDef.field) : null);
    return name != null ? String(name) : '';
}

export class ColumnHeaderEditService extends BeanStub implements NamedBean, IColumnHeaderEditService {
    beanName = 'colHeaderEditSvc' as const;

    private activePopup: ColumnHeaderEditPopup | null = null;

    public postConstruct(): void {
        // Editing can be launched from the column chooser context menu, so tie the popup's lifetime to it.
        this.addManagedEventListeners({
            columnMenuVisibleChanged: (event) => {
                if (!event.visible && event.key === 'columnChooser') {
                    this.destroyActivePopup();
                }
            },
        });
    }

    public setColumnHeaderName(key: ColKey, headerName: string | null, source: ColumnEventType = 'api'): void {
        const column = this.beans.colModel.getCol(key);
        column?.setHeaderNameOverride(headerName, source);
    }

    public showHeaderNameEditor(column: AgColumn): void {
        this.destroyActivePopup();

        const initialValue = getEditableHeaderName(column);

        this.activePopup = this.createBean(
            new ColumnHeaderEditPopup({
                initialValue,
                onClosed: (committed, value) => {
                    if (committed && value.trim() !== initialValue.trim()) {
                        const trimmed = value.trim();
                        column.setHeaderNameOverride(trimmed.length ? trimmed : null, 'uiColumnHeaderEdit');
                    }
                    this.destroyActivePopup();
                },
            })
        );
    }

    private destroyActivePopup(): void {
        if (this.activePopup) {
            this.destroyBean(this.activePopup);
            this.activePopup = null;
        }
    }

    public override destroy(): void {
        this.destroyActivePopup();
        super.destroy();
    }
}
