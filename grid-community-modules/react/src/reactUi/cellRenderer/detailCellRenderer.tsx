import React, { useState, useMemo, useRef, useContext, useCallback, forwardRef, useImperativeHandle } from "react";
import { CssClasses } from "../utils";
import { IDetailCellRenderer, IDetailCellRendererCtrl, IDetailCellRendererParams, GridOptions, GridApi, ColumnApi } from "@ag-grid-community/core";
import { BeansContext } from "../beansContext";
import { AgGridReactUi } from "../agGridReactUi";
import { useEffectOnce, useLayoutEffectOnce } from "../useEffectOnce";

const DetailCellRenderer = (props: IDetailCellRendererParams, ref: any) => {

    const { ctrlsFactory, context, gridOptionsService, resizeObserverService, clientSideRowModel, serverSideRowModel } = useContext(BeansContext);

    const [cssClasses, setCssClasses] = useState<CssClasses>(new CssClasses());
    const [gridCssClasses, setGridCssClasses] = useState<CssClasses>(new CssClasses());
    const [detailGridOptions, setDetailGridOptions] = useState<GridOptions>();
    const [detailRowData, setDetailRowData] = useState<any[]>();

    const ctrlRef = useRef<IDetailCellRendererCtrl>();
    const eGuiRef = useRef<HTMLDivElement>(null);

    const topClassName = useMemo(() => cssClasses.toString() + ' ag-details-row', [cssClasses]);
    const gridClassName = useMemo(() => gridCssClasses.toString() + ' ag-details-grid', [gridCssClasses]);

    if (ref) {
        useImperativeHandle(ref, () => ({
            refresh() { return ctrlRef.current!.refresh(); }
        }));
    }
    
    useLayoutEffectOnce(() => {
        if (props.template && typeof props.template === 'string') {
            console.warn('AG Grid: detailCellRendererParams.template is not supported by React - this only works with frameworks that work against String templates. To change the template, please provide your own React Detail Cell Renderer.');
        }
    });

    useLayoutEffectOnce(() => {
        const compProxy: IDetailCellRenderer = {
            addOrRemoveCssClass: (name: string, on: boolean) => setCssClasses(prev => prev.setClass(name, on)),
            addOrRemoveDetailGridCssClass: (name: string, on: boolean) => setGridCssClasses(prev => prev.setClass(name, on)),
            setDetailGrid: gridOptions => setDetailGridOptions(gridOptions),
            setRowData: rowData => setDetailRowData(rowData),
            getGui: () => eGuiRef.current!
        };

        const ctrl = ctrlsFactory.getInstance('detailCellRenderer') as IDetailCellRendererCtrl;
        if (!ctrl) { return; } // should never happen, means master/detail module not loaded
        context.createBean(ctrl);

        ctrl.init(compProxy, props);

        ctrlRef.current = ctrl;

        let resizeObserverDestroyFunc: () => void;

        if (gridOptionsService.is('detailRowAutoHeight')) {
            const checkRowSizeFunc = () => {
                // when disposed, current is null, so nothing to do, and the resize observer will
                // be disposed of soon
                if (eGuiRef.current==null) { return; }

                const clientHeight = eGuiRef.current.clientHeight;

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
    
            resizeObserverDestroyFunc = resizeObserverService.observeResize(eGuiRef.current!, checkRowSizeFunc);
            checkRowSizeFunc();
        }

        return () => {
            context.destroyBean(ctrl);
            if (resizeObserverDestroyFunc) {
                resizeObserverDestroyFunc();
            }
        };
    });

    const setGridApi = useCallback( (api: GridApi, columnApi: ColumnApi) => {
        ctrlRef.current!.registerDetailWithMaster(api, columnApi)
    }, []);

    return (
        <div className={topClassName} ref={eGuiRef}>
            {
                detailGridOptions &&
                <AgGridReactUi className={gridClassName} {...detailGridOptions} rowData={detailRowData} setGridApi={ setGridApi }></AgGridReactUi> 
            }
        </div>
    );
};

export default forwardRef(DetailCellRenderer);
