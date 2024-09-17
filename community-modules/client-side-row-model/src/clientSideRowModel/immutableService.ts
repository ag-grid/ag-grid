import type { BeanCollection, IImmutableService, IRowModel, NamedBean } from '@ag-grid-community/core';
import { BeanStub, _errorOnce, _isClientSideRowModel } from '@ag-grid-community/core';

import type { ClientSideRowModel } from './clientSideRowModel';

export class ImmutableService extends BeanStub implements NamedBean, IImmutableService {
    beanName = 'immutableService' as const;

    private rowModel: IRowModel;

    public wireBeans(beans: BeanCollection): void {
        this.rowModel = beans.rowModel;
    }

    private clientSideRowModel: ClientSideRowModel | null = null;

    public postConstruct(): void {
        if (_isClientSideRowModel(this.gos)) {
            this.clientSideRowModel = this.rowModel as ClientSideRowModel;

            this.addManagedPropertyListener('rowData', () => this.onRowDataUpdated());
        }
    }

    public isActive(): boolean {
        const getRowIdProvided = this.gos.exists('getRowId');
        // this property is a backwards compatibility property, for those who want
        // the old behaviour of Row IDs but NOT Immutable Data.
        const resetRowDataOnUpdate = this.gos.get('resetRowDataOnUpdate');

        if (resetRowDataOnUpdate) {
            return false;
        }
        return getRowIdProvided;
    }

    public setRowData<TData>(rowData: TData[]): void {
        const clientSideRowModel = this.clientSideRowModel;
        if (!clientSideRowModel) {
            _errorOnce('ImmutableService only works with ClientSideRowModel');
            return;
        }
        clientSideRowModel.setImmutableRowData(rowData);
    }

    private onRowDataUpdated(): void {
        const rowData = this.gos.get('rowData');
        const clientSideRowModel = this.clientSideRowModel!;
        if (rowData) {
            if (this.isActive()) {
                clientSideRowModel.setImmutableRowData(rowData);
            } else {
                clientSideRowModel.setRowData(rowData);
            }
        }
    }
}
