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

export function GridComp(props: { context: Context }) {

    const [rtlClass, setRtlClass] = useState<string>('');
    const [keyboardFocusClass, setKeyboardFocusClass] = useState<string>('');
    const [layoutClass, setLayoutClass] = useState<string>('');
    const [cursor, setCursor] = useState<string | null>(null);
    const [userSelect, setUserSelect] = useState<string | null>(null);

    const eRootWrapper = useRef<HTMLDivElement>(null);
    const eGridBodyParent = useRef<HTMLDivElement>(null);



    // initialise the UI
    useEffect( ()=> {

        const {context} = props;

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
    }, []);

    const rootWrapperClasses = classesList('ag-root-wrapper', rtlClass, keyboardFocusClass, layoutClass);
    const rootWrapperBodyClasses = classesList('ag-root-wrapper-body', layoutClass);

    const topStyle = {
        userSelect: userSelect!=null ? userSelect : '',
        'WebkitUserSelect': userSelect!=null ? userSelect : '',
        cursor: cursor!=null ? cursor : ''
    };

    return (
        <div ref={eRootWrapper} className={rootWrapperClasses} style={topStyle}>
            { props.context &&
            <div className={ rootWrapperBodyClasses } ref={ eGridBodyParent }>
                <GridBodyComp context={ props.context }/>
            </div>
            }
        </div>
    );
}
