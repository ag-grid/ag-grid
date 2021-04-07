import {AgGridColumn} from "../agGridColumn";
import {ComponentUtil, GridCoreCreator, Context, GridOptions} from "@ag-grid-community/core";
import React, { useEffect, useRef, useState } from "react";
import {GridComp} from "./gridComp";

export function AgGridReactNext(props: any) {

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
        const gridCoreCreator = new GridCoreCreator();
        gridCoreCreator.create(null as any as HTMLElement, gridOptions, context => {
            setContext(context);
        }, gridParams);

        // new Grid(null!, gridOptions, gridParams);
        destroyFuncs.push( ()=>gridOptions.api!.destroy() );

        return ()=> destroyFuncs.forEach( f => f() );
    }, []);

    return (
        <>
            {context && <GridComp context={context}/> }
        </>
    );
}
