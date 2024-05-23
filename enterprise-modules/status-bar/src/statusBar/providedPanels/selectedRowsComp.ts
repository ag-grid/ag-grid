import type { BeanCollection, IRowModel, ISelectionService, IStatusPanelComp } from '@ag-grid-community/core';
import { Events, _formatNumberCommas } from '@ag-grid-community/core';

import { AgNameValue } from './agNameValue';

export class SelectedRowsComp extends AgNameValue implements IStatusPanelComp {
    private rowModel: IRowModel;
    private selectionService: ISelectionService;

    public wireBeans(beans: BeanCollection) {
        super.wireBeans(beans);
        this.rowModel = beans.rowModel;
        this.selectionService = beans.selectionService;
    }

    public postConstruct(): void {
        if (!this.isValidRowModel()) {
            console.warn(
                `AG Grid: agSelectedRowCountComponent should only be used with the client and server side row model.`
            );
            return;
        }

        this.setLabel('selectedRows', 'Selected');

        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-selected-row-count');

        this.onRowSelectionChanged();

        const eventListener = this.onRowSelectionChanged.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, eventListener);
        this.addManagedListener(this.eventService, Events.EVENT_SELECTION_CHANGED, eventListener);
    }

    private isValidRowModel() {
        // this component is only really useful with client or server side rowmodels
        const rowModelType = this.rowModel.getType();
        return rowModelType === 'clientSide' || rowModelType === 'serverSide';
    }

    private onRowSelectionChanged() {
        const selectedRowCount = this.selectionService.getSelectionCount();
        if (selectedRowCount < 0) {
            this.setValue('?');
            this.setDisplayed(true);
            return;
        }
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');
        this.setValue(_formatNumberCommas(selectedRowCount, thousandSeparator, decimalSeparator));
        this.setDisplayed(selectedRowCount > 0);
    }

    public init() {}

    public refresh(): boolean {
        return true;
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }
}
