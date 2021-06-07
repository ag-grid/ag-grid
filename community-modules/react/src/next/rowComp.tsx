import React, { useEffect, useRef, useState } from "react";
import { Context, IRowComp, RowCtrl } from "@ag-grid-community/core";
import { CssClasses } from "./utils";

export function RowComp(params: {context: Context, rowCtrl: RowCtrl, pinned: string | null}) {

    const {context, rowCtrl, pinned} = params;

    const [height, setHeight] = useState<string>('');
    const [top, setTop] = useState<string>('');
    const [transform, setTransform] = useState<string>('');
    const [cssClasses, setCssClasses] = useState<CssClasses>(new CssClasses());
    const [rowIndex, setRowIndex] = useState<string>('');
    const [ariaRowIndex, setAriaRowIndex] = useState<number>();
    const [ariaExpanded, setAriaExpanded] = useState<boolean>();

    const eGui = useRef<HTMLDivElement>(null);

    useEffect(()=> {
        const beansToDestroy: any[] = [];

        const compProxy: IRowComp = {
            setHeight: setHeight,
            setTop: setTop,
            setTransform: setTransform,
            addOrRemoveCssClass: ()=>true,//(name, on) => setCssClasses( prev => prev.setClass(name, on) ),
            setRowIndex: setRowIndex,
            setAriaRowIndex: setAriaRowIndex,
            setAriaExpanded: setAriaExpanded,
            forEachCellComp: callback => true,
            addStylesToElement: styles => true,
            setAriaSelected: value => true,
            destroy: ()=> true,
            getCellComp: colId => null,
            getAllCellComps: () => [],
            onColumnChanged: () => true,
            destroyCells: cellComps => true,
            getFullWidthRowComp: ()=> null,
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

    const className = cssClasses.toString();

    return (
        <div ref={eGui} className={className} style={rowStyles} role="row" row-index={rowIndex} aria-rowindex={ariaRowIndex} aria-expanded={ariaExpanded}>{rowCtrl.getRowNode().data.make}</div>
    );
}