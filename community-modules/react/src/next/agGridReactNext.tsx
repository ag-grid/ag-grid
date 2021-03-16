import {AgGridColumn} from "../agGridColumn";
import {ComponentUtil, Grid, Context, GridOptions, HeaderRowSt, HeadlessService, RowSt, RowContainerSt} from "@ag-grid-community/core";
import React, {useEffect, useState} from "react";
import {GridCoreComp, GridPanelComp} from "./gridPanelComp";

export function AgGridReactNext(props: any) {

    const [headerRows, setHeaderRows] = useState<HeaderRowSt[]>([]);
    const [rows, setRows] = useState<RowSt[]>([]);
    const [centerRowContainer, setCenterRowContainer] = useState<RowContainerSt>({});

    const [context, setContext] = useState<Context>();

    useEffect(()=> {

        const modules = props.modules || [];
        const gridParams = {
            // providedBeanInstances: {
            //     agGridReact: this,
            //     frameworkComponentWrapper: new ReactFrameworkComponentWrapper(this)
            // },
            modules
        };

        let gridOptions: GridOptions = {...props.gridOptions};
        const {children} = props;

        if (AgGridColumn.hasChildColumns(children)) {
            gridOptions.columnDefs = AgGridColumn.mapChildColumnDefs(children);
        }

        gridOptions = ComponentUtil.copyAttributesToGridOptions(gridOptions, props);

        const destroyFuncs: (()=>void)[] = [];

        // don't need the return value
        new Grid(null!, gridOptions, gridParams);
        destroyFuncs.push( ()=>gridOptions.api!.destroy() );

        const headlessService: HeadlessService = (gridOptions.api as any).headlessService;

        setContext((gridOptions.api as any).context);

        const addHeadlessServiceEventListener = (event: string, listener: (()=>void)) => {
            listener();
            headlessService.addEventListener(event, listener);
            destroyFuncs.push( ()=> headlessService.removeEventListener(event, listener))
        };

        addHeadlessServiceEventListener(HeadlessService.EVENT_ROWS_UPDATED, ()=> {
            setRows(headlessService.getRows());
        });

        addHeadlessServiceEventListener(HeadlessService.EVENT_HEADERS_UPDATED, ()=> {
            setHeaderRows(headlessService.getHeaderRows());
        });

        addHeadlessServiceEventListener(HeadlessService.EVENT_ROW_CONTAINER_UPDATED, ()=> {
            setCenterRowContainer(headlessService.getCenterRowContainer());
        });

        return ()=> destroyFuncs.forEach( f => f() );
    }, []);

    return (
        <>
            {context && <GridCoreComp rows={rows} headerRows={headerRows} centerRowContainer={centerRowContainer} context={context} /> }
        </>
    );
}
