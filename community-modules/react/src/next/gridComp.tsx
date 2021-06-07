import React, { useEffect, useRef, useState } from "react";
import {
    Context,
    FocusService,
    GridCtrl,GridOptions,ComponentUtil,GridCoreCreator,
    IGridComp,
    AgStackComponentsRegistry
} from "@ag-grid-community/core";
import { GridBodyComp } from "./gridBodyComp";
import { classesList } from "./utils";
import { AgGridColumn } from "../agGridColumn";

export function GridComp(props: any) {

    const [context, setContext] = useState<Context>();

    const [rtlClass, setRtlClass] = useState<string>('');
    const [keyboardFocusClass, setKeyboardFocusClass] = useState<string>('');
    const [layoutClass, setLayoutClass] = useState<string>('');
    const [cursor, setCursor] = useState<string | null>(null);
    const [userSelect, setUserSelect] = useState<string | null>(null);

    const eRootWrapper = useRef<HTMLDivElement>(null);
    const eGridBodyParent = useRef<HTMLDivElement>(null);

    // initialise the grid core
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
        gridCoreCreator.create(eRootWrapper.current!, gridOptions, context => {
            setContext(context);
        }, gridParams);

        // new Grid(null!, gridOptions, gridParams);
        destroyFuncs.push( ()=>gridOptions.api!.destroy() );

        return ()=> destroyFuncs.forEach( f => f() );
    }, []);

    // initialise the UI
    useEffect( ()=> {
        if (!context) { return; }

        const beansToDestroy: any[] = [];

        const ctrl = context.createBean(new GridCtrl());
        beansToDestroy.push(ctrl);

        const compProxy: IGridComp = {
            destroyGridUi:
                ()=> {}, // do nothing, as framework users destroy grid by removing the comp
            setRtlClass: setRtlClass,
            addOrRemoveKeyboardFocusClass:
                (addOrRemove: boolean) => setKeyboardFocusClass(addOrRemove ? FocusService.AG_KEYBOARD_FOCUS : ''),
            forceFocusOutOfContainer: ()=> {},//this.forceFocusOutOfContainer.bind(this),
            updateLayoutClasses: setLayoutClass,
            getFocusableContainers: ()=>[],//this.getFocusableContainers.bind(this)
            setCursor: setCursor,
            setUserSelect: setUserSelect
        };

        ctrl.setComp(compProxy, eRootWrapper.current!, eRootWrapper.current!);

        // should be shared
        const insertFirstPosition = (parent: HTMLElement, child: HTMLElement) => parent.insertBefore(child, parent.firstChild);

        const agStackComponentsRegistry: AgStackComponentsRegistry = context.getBean('agStackComponentsRegistry');
        const HeaderDropZonesClass = agStackComponentsRegistry.getComponentClass('AG-GRID-HEADER-DROP-ZONES');
        if (ctrl.showDropZones() && HeaderDropZonesClass) {
            const headerDropZonesComp = context.createBean(new HeaderDropZonesClass());
            insertFirstPosition(eRootWrapper.current!, headerDropZonesComp.getGui());
            beansToDestroy.push(headerDropZonesComp);
        }

        return ()=> {
            beansToDestroy.forEach( b => context.destroyBean(b) );
        };
    }, [context]);

    const rootWrapperClasses = classesList('ag-root-wrapper', rtlClass, keyboardFocusClass, layoutClass);
    const rootWrapperBodyClasses = classesList('ag-root-wrapper-body', layoutClass);

    const topStyle = {
        'user-select': userSelect!=null ? userSelect : '',
        '-webkit-user-select': userSelect!=null ? userSelect : '',
        cursor: cursor!=null ? cursor : ''
    };

    return (
        <div ref={eRootWrapper} className={rootWrapperClasses} style={topStyle}>
            { context &&
            <div className={ rootWrapperBodyClasses } ref={ eGridBodyParent }>
                <GridBodyComp context={ context }/>
            </div>
            }
        </div>
    );
}
