import type {
    AgColumn,
    FilterDestroyedEvent,
    FilterHandler,
    FilterHandlerParams,
    IFilterParams,
} from 'ag-grid-community';
import { BeanStub, _warn } from 'ag-grid-community';

import type { GroupFilterService } from './groupFilterService';

export type GroupFilterHandlerEventType = 'sourceColumnsChanged' | 'selectedColumnChanged' | 'destroyed';
export class GroupFilterHandler
    extends BeanStub<GroupFilterHandlerEventType>
    implements FilterHandler<any, any, null, IFilterParams>
{
    private params: FilterHandlerParams<any, any, null, IFilterParams<any, any>>;
    public selectedColumn: AgColumn | undefined;
    public sourceColumns: AgColumn[];
    public hasMultipleColumns: boolean;

    public init(params: FilterHandlerParams<any, any, null, IFilterParams<any, any>>): void {
        this.params = params;
        this.validateModel(params);
        this.updateColumns();
        this.addManagedEventListeners({
            columnRowGroupChanged: this.updateColumns.bind(this),
            filterDestroyed: (event) => this.onFilterDestroyed(event),
        });
    }

    public refresh(params: FilterHandlerParams<any, any, null, IFilterParams<any, any>>): void {
        this.params = params;
        this.validateModel(params);
        if (params.source === 'colDef') {
            this.updateColumns();
        }
    }

    public doesFilterPass(): boolean {
        // filters should only be evaluated on the child columns
        return true;
    }

    public setSelectedColumn(selectedColumn: AgColumn | undefined): void {
        this.selectedColumn = selectedColumn;
        this.dispatchLocalEvent({ type: 'selectedColumnChanged' });
    }

    private validateModel(params: FilterHandlerParams<any, any, null, IFilterParams<any, any>>): void {
        // model should always be null
        if (params.model != null) {
            params.onModelChange(null);
        }
    }

    private getSourceColumns(): AgColumn[] {
        const groupColumn = this.params.column as AgColumn;
        if (this.gos.get('treeData')) {
            _warn(237);
            return [];
        }
        const sourceColumns = (this.beans.groupFilter as GroupFilterService).getSourceColumns(groupColumn);
        if (!sourceColumns) {
            _warn(183);
            return [];
        }
        return sourceColumns;
    }

    private updateColumns(): void {
        const allSourceColumns = this.getSourceColumns();
        const sourceColumns = allSourceColumns.filter((sourceColumn) => sourceColumn.isFilterAllowed());
        this.sourceColumns = sourceColumns;
        let selectedColumn: AgColumn | undefined;
        let hasMultipleColumns: boolean;
        if (!sourceColumns.length) {
            selectedColumn = undefined;
            hasMultipleColumns = false;
        } else {
            if (allSourceColumns.length === 1) {
                selectedColumn = sourceColumns[0];
                hasMultipleColumns = false;
            } else {
                // keep the old selected column if it's still valid
                selectedColumn = this.selectedColumn;
                if (!selectedColumn || !sourceColumns.some((column) => column.getId() === selectedColumn!.getId())) {
                    selectedColumn = sourceColumns[0];
                }
                hasMultipleColumns = true;
            }
        }
        this.selectedColumn = selectedColumn;
        this.hasMultipleColumns = hasMultipleColumns;
        this.dispatchLocalEvent({ type: 'sourceColumnsChanged' });
    }

    private onFilterDestroyed({ column: eventColumn, source }: FilterDestroyedEvent): void {
        if (source === 'gridDestroyed') {
            return;
        }
        const colId = eventColumn.getColId();
        if (this.sourceColumns?.some((column) => column.getColId() === colId)) {
            // filter may already be getting recreated, so wait before updating
            setTimeout(() => {
                if (this.isAlive()) {
                    this.updateColumns();
                }
            });
        }
    }
}
