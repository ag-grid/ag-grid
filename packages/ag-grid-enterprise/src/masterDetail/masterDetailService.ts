import type { BeanCollection, BeanName, IMasterDetailService, IRowModel, NamedBean, RowCtrl } from 'ag-grid-community';
import { BeanStub, _isClientSideRowModel, _isServerSideRowModel, _observeResize } from 'ag-grid-community';

export class MasterDetailService extends BeanStub implements NamedBean, IMasterDetailService {
    beanName: BeanName = 'masterDetailService' as const;

    private rowModel: IRowModel;

    public wireBeans(beans: BeanCollection): void {
        this.rowModel = beans.rowModel;
    }

    public setupDetailRowAutoHeight(rowCtrl: RowCtrl, eDetailGui: HTMLElement): void {
        const { gos } = this;
        if (!gos.get('detailRowAutoHeight')) {
            return;
        }

        const checkRowSizeFunc = () => {
            const clientHeight = eDetailGui.clientHeight;

            // if the UI is not ready, the height can be 0, which we ignore, as otherwise a flicker will occur
            // as UI goes from the default height, to 0, then to the real height as UI becomes ready. this means
            // it's not possible for have 0 as auto-height, however this is an improbable use case, as even an
            // empty detail grid would still have some styling around it giving at least a few pixels.
            if (clientHeight != null && clientHeight > 0) {
                // we do the update in a timeout, to make sure we are not calling from inside the grid
                // doing another update
                const updateRowHeightFunc = () => {
                    const { rowModel } = this;
                    const rowNode = rowCtrl.getRowNode();
                    rowNode.setRowHeight(clientHeight);
                    if (_isClientSideRowModel(gos, rowModel) || _isServerSideRowModel(gos, rowModel)) {
                        rowModel.onRowHeightChanged();
                    }
                };
                window.setTimeout(updateRowHeightFunc, 0);
            }
        };

        const resizeObserverDestroyFunc = _observeResize(gos, eDetailGui, checkRowSizeFunc);

        rowCtrl.addDestroyFunc(resizeObserverDestroyFunc);

        checkRowSizeFunc();
    }
}
