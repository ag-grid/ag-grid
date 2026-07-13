import type {
    AgColumn,
    ColKey,
    ColumnEventType,
    IColumnHeaderEditService,
    NamedBean,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { ColumnHeaderEditPopup } from './columnHeaderEditPopup';

export class ColumnHeaderEditService extends BeanStub implements NamedBean, IColumnHeaderEditService {
    beanName = 'colHeaderEditSvc' as const;

    private activePopup: ColumnHeaderEditPopup | null = null;

    public setColumnHeaderName(key: ColKey, headerName: string | null, source: ColumnEventType = 'api'): void {
        const column = this.beans.colModel.getCol(key);
        column?.setHeaderNameOverride(headerName, source);
    }

    public showHeaderNameEditor(column: AgColumn): void {
        this.destroyActivePopup();

        const initialValue = this.beans.colNames.getDisplayNameForColumn(column, 'header') ?? '';

        this.activePopup = this.createBean(
            new ColumnHeaderEditPopup({
                initialValue,
                onClosed: (committed, value) => {
                    if (committed) {
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
