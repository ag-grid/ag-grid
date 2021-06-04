import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Context,
    IRowContainerComp,
    IRowComp,
    RowContainerCtrl,
    RowContainerName,
    RowCtrl,
    CellComp
} from "ag-grid-community";
import { classesList } from "./utils";
import { setAriaExpanded, setAriaRowIndex, setAriaSelected } from "ag-grid-community/dist/cjs/utils/aria";
import { addStylesToElement } from "ag-grid-community/dist/cjs/utils/dom";

export function RowComp(params: {context: Context, rowCtrl: RowCtrl, pinned: string | null}) {

    const {context, rowCtrl, pinned} = params;

    const [height, setHeight] = useState<string>('');
    const [top, setTop] = useState<string>('');
    const [transform, setTransform] = useState<string>('');
    const [addOrRemoveClasses, setAddOrRemoveClasses] = useState<{[name:string]:boolean}>({});

    const eGui = useRef<HTMLDivElement>(null);

    useEffect(()=> {
        const beansToDestroy: any[] = [];

        const compProxy: IRowComp = {
            setHeight: setHeight,
            setTop: setTop,
            setTransform: t => {
                console.log('setting transform ' + t);
                setTransform(t);
            },
            addOrRemoveCssClass: (name, on) => {
                setAddOrRemoveClasses( prev => {
                    const next = {...prev};
                    next[name] = on;
                    return next;
                });
            },
            onColumnChanged: () => true,
            getFullWidthRowComp: ()=> null,
            setAriaExpanded: on => true,
            destroyCells: cellComps => true,
            forEachCellComp: callback => true,
            addStylesToElement: styles => true,
            setAriaSelected: value => true,
            destroy: ()=> true,
            getCellComp: colId => null,
            getAllCellComps: () => [],
            setRowIndex: rowIndex => null,
            setAriaRowIndex: rowIndex => null
        };

        rowCtrl.setComp(compProxy, eGui.current!, pinned);

        return ()=> {
            beansToDestroy.forEach( b => context.destroyBean(b) );
            // destroyFuncs.forEach( f => f() );
        };

    }, []);

    const rowStyles = {
        height,
        top,
        transform
    };

    const rowClasses = Object.keys(addOrRemoveClasses).filter( key => addOrRemoveClasses[key] ).join(' ');

    return (
        <div ref={eGui} className={rowClasses} style={rowStyles} role="row">Row Comp {rowCtrl.getInstanceId()}</div>
    );
}