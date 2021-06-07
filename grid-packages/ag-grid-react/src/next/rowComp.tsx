import React, { useEffect, useRef, useState } from "react";
import { Context, IRowComp, RowCtrl } from "ag-grid-community";
import { CssClasses } from "./utils";

export function RowComp(params: {context: Context, rowCtrl: RowCtrl, pinned: string | null}) {

    const {context, rowCtrl, pinned} = params;

    const [height, setHeight] = useState<string>();
    const [top, setTop] = useState<string>();
    const [transform, setTransform] = useState<string>();
    const [cssClasses, setCssClasses] = useState<CssClasses>(new CssClasses());
    const [rowIndex, setRowIndex] = useState<string>();
    const [rowId, setRowId] = useState<string>();
    const [rowBusinessKey, setRowBusinessKey] = useState<string>();
    const [tabIndex, setTabIndex] = useState<number>();
    const [ariaRowIndex, setAriaRowIndex] = useState<number>();
    const [ariaExpanded, setAriaExpanded] = useState<boolean>();
    const [ariaLabel, setAriaLabel] = useState<string>();
    const [userStyles, setUserStyles] = useState<any>();

    const eGui = useRef<HTMLDivElement>(null);

    useEffect(()=> {
        const beansToDestroy: any[] = [];

        const compProxy: IRowComp = {
            setHeight: value => setHeight(value),
            setTop: value => setTop(value),
            setTransform: value => setTransform(value),
            addOrRemoveCssClass: (name, on) => setCssClasses( prev => prev.setClass(name, on) ),
            setRowIndex: value => setRowIndex(value),
            setAriaRowIndex: value => setAriaRowIndex(value),
            setAriaExpanded: value => setAriaExpanded(value),
            setAriaLabel: value => setAriaLabel(value),
            setRowId: value => setRowId(value),
            setRowBusinessKey: value => setRowBusinessKey(value),
            setTabIndex: value => setTabIndex(value),
            setUserStyles: styles => setUserStyles(styles),
            forEachCellComp: callback => true,
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
        <div ref={eGui} className={className} style={rowStyles} role="row" row-index={rowIndex}
             aria-rowindex={ariaRowIndex} aria-expanded={ariaExpanded} aria-label={ariaLabel}
             row-id={rowId} row-business-key={rowBusinessKey} tabIndex={tabIndex}>
            {rowCtrl.getRowNode().data.make}
        </div>
    );
}