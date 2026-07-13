import type { AgColumn, ColKey, ColumnEventType, IColumnHeaderEditService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { ColumnHeaderEditPopup } from './columnHeaderEditPopup';

export class ColumnHeaderEditService extends BeanStub implements NamedBean, IColumnHeaderEditService {
    beanName = 'colHeaderEditSvc' as const;

    private activePopup: ColumnHeaderEditPopup | null = null;
    private removePopupColListener: (() => void) | null = null;

    private getEditableHeaderName(column: AgColumn): string {
        const name = this.beans.colNames.getDisplayNameForColumn(column, 'columnHeaderEdit');
        return name != null ? String(name) : '';
    }

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

        let initialValue = this.getEditableHeaderName(column);

        const popup = this.createBean(
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
        this.activePopup = popup;

        // Keep the editor in sync if the column's def changes underneath it (e.g. a programmatic rename).
        this.removePopupColListener = this.addManagedListeners(column, {
            colDefChanged: () => {
                initialValue = this.getEditableHeaderName(column);
                popup.setValue(initialValue);
            },
        })[0];
    }

    private destroyActivePopup(): void {
        this.removePopupColListener?.();
        this.removePopupColListener = null;
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
