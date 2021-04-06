import React, { useEffect, useRef, useState } from "react";
import {ComponentUtil, GridCoreCreator, GridCompView, GridCompController, Context, GridOptions, HeaderRowSt, HeadlessService, RowSt, RowContainerSt} from "@ag-grid-community/core";

export function GridComp(params: {context: Context}) {

    const [con, setCon] = useState<GridCompController>();

    const [rtlClass, setRtlClass] = useState<string>();

    const eRootWrapper = useRef<HTMLDivElement>(null);

    // fixme, how should we pass this in?
    const eGridDiv: HTMLElement = null as any as HTMLElement;

    useEffect( ()=> {
        if (!eRootWrapper.current) { return; }

        const con = params.context.createBean(new GridCompController());
        setCon(con);

        const view: GridCompView = {
            destroyGridUi:
                ()=> {}, // do nothing, as framework users destroy grid by removing the comp
            setRtlClass:
                (cssClass: string) => {},//addCssClass(this.getGui(), cssClass),
            addOrRemoveKeyboardFocusClass:
                (addOrRemove: boolean) => {},//this.addOrRemoveCssClass(FocusController.AG_KEYBOARD_FOCUS, addOrRemove),
            forceFocusOutOfContainer: ()=>{},//this.forceFocusOutOfContainer.bind(this),
            updateLayoutClasses: ()=>{},//this.updateLayoutClasses.bind(this),
            getFocusableContainers: ()=>[],//this.getFocusableContainers.bind(this)
        };

        // con.setView(view, eGridDiv, eRootWrapper.current, null, null);

        return ()=> {
            params.context.destroyBean(con);
        };
    }, [eRootWrapper.current]);

    return (
        <div ref={eRootWrapper} className="ag-root-wrapper">
            <div className="ag-root-wrapper-body" ref="rootWrapperBody">
                <GridBodyComp/>
            </div>
        </div>
    );
}

function GridBodyComp() {
    return (<div>Grid Body</div>);
}

