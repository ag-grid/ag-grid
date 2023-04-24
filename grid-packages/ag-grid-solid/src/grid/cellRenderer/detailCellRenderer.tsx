import { GridOptions, IDetailCellRenderer, IDetailCellRendererCtrl, IDetailCellRendererParams } from "ag-grid-community";
import { createMemo, createSignal, onMount, useContext } from 'solid-js';
import AgGridSolid, { AgGridSolidRef } from '../agGridSolid';
import { BeansContext } from '../core/beansContext';
import { CssClasses } from '../core/utils';

const DetailCellRenderer = (props: IDetailCellRendererParams) => {

    const {ctrlsFactory, context, 
        gridOptionsService, resizeObserverService, 
            clientSideRowModel, serverSideRowModel} = useContext(BeansContext);

    const [getCssClasses, setCssClasses] = createSignal<CssClasses>(new CssClasses());
    const [getGridCssClasses, setGridCssClasses] = createSignal<CssClasses>(new CssClasses());
    const [getDetailGridOptions, setDetailGridOptions] = createSignal<GridOptions>();
    const [getDetailRowData, setDetailRowData] = createSignal<any[]>();

    let ctrl: IDetailCellRendererCtrl;
    let eGuiRef: HTMLDivElement;

    const getCssClassesStr = createMemo(() => getCssClasses().toString() + ' ag-details-row');
    const getGridCssClassesStr = createMemo(() => getGridCssClasses().toString() + ' ag-details-grid');

    (props as any).ref( () => ({
        // force new instance when grid tries to refresh
        refresh() { return ctrl.refresh(); }
    }));

    onMount(() => {
        if (props.template && typeof props.template === 'string') {
            console.warn('AG Grid: detailCellRendererParams.template is not supported by Solid - this only works with frameworks that work against String templates. To change the template, please provide your own Solid Detail Cell Renderer.');
        }

        const compProxy: IDetailCellRenderer = {
            addOrRemoveCssClass: (name: string, on: boolean) => setCssClasses(getCssClasses().setClass(name, on)),
            addOrRemoveDetailGridCssClass: (name: string, on: boolean) => setGridCssClasses(getGridCssClasses().setClass(name, on)),
            setDetailGrid: gridOptions => setDetailGridOptions(gridOptions),
            setRowData: rowData => setDetailRowData(rowData),
            getGui: () => eGuiRef
        };

        ctrl = ctrlsFactory.getInstance('detailCellRenderer') as IDetailCellRendererCtrl;
        if (!ctrl) { return; } // should never happen, means master/detail module not loaded
        context.createBean(ctrl);

        ctrl.init(compProxy, props);

        let resizeObserverDestroyFunc: () => void;

        if (gridOptionsService.is('detailRowAutoHeight')) {
            const checkRowSizeFunc = () => {
                // when disposed, current is null, so nothing to do, and the resize observer will
                // be disposed of soon
                if (eGuiRef==null) { return; }

                const clientHeight = eGuiRef.clientHeight;

                // if the UI is not ready, the height can be 0, which we ignore, as otherwise a flicker will occur
                // as UI goes from the default height, to 0, then to the real height as UI becomes ready. this means
                // it's not possible for have 0 as auto-height, however this is an improbable use case, as even an
                // empty detail grid would still have some styling around it giving at least a few pixels.
                if (clientHeight != null && clientHeight > 0) {
                    // we do the update in a timeout, to make sure we are not calling from inside the grid
                    // doing another update
                    const updateRowHeightFunc = () => {
                        props.node.setRowHeight(clientHeight);
                        if (clientSideRowModel) {
                            clientSideRowModel.onRowHeightChanged();
                        } else if (serverSideRowModel) {
                            serverSideRowModel.onRowHeightChanged();
                        }
                    };
                    setTimeout(updateRowHeightFunc, 0);
                }
            };
    
            resizeObserverDestroyFunc = resizeObserverService.observeResize(eGuiRef, checkRowSizeFunc);
            checkRowSizeFunc();
        }

        return () => {
            context.destroyBean(ctrl);
            if (resizeObserverDestroyFunc) {
                resizeObserverDestroyFunc();
            }
        };
    });

    const setRef = (ref: AgGridSolidRef) => {
        ctrl.registerDetailWithMaster(ref.api, ref.columnApi)
    };

    return (
        <div class={getCssClassesStr()} ref={eGuiRef!}>
            {
                getDetailGridOptions() &&
                <AgGridSolid class={getGridCssClassesStr()} {...getDetailGridOptions()} rowData={getDetailRowData()} ref={ setRef }></AgGridSolid> 
            }
        </div>
    );
};

export default DetailCellRenderer;
