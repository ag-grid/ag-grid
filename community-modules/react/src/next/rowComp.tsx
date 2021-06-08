import React, { useEffect, useRef, useState } from "react";
import { Context, IRowComp, RowCtrl, _, Column, RowNode } from "@ag-grid-community/core";
import { CssClasses } from "./utils";
import { CellComp } from "./cellComp";

interface ColumnMap {
    [instanceId: number]:Column
}

interface Columns {
    list: Column[],
    instanceIdMap: ColumnMap
}

function maintainOrderOnColumns(prev: Columns, next: Column[], domOrder: boolean): Columns {
    if (domOrder) {
        const res: Columns = {list: next, instanceIdMap: {}};
        next.forEach(c => res.instanceIdMap[c.getInstanceId()] = c);
        return res;
    } else {
        // if dom order not important, we don't want to change the order
        // of the elements in the dom, as this would break transition styles
        const oldCols: Column[] = [];
        const newCols: Column[] = [];
        const newInstanceIdMap: ColumnMap = {};
        next.forEach(c => {
            if (prev.instanceIdMap[c.getInstanceId()]!=null) {
                oldCols.push(c);
            } else {
                newCols.push(c);
            }
            newInstanceIdMap[c.getInstanceId()] = c;
        });
        const res: Columns = {
            list: [...oldCols, ...newCols],
            instanceIdMap: newInstanceIdMap
        };
        return res;
    }
}

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
    const [ariaSelected, setAriaSelected] = useState<boolean>();
    const [userStyles, setUserStyles] = useState<any>();
    const [columns, setColumns] = useState<Columns>({ list: [], instanceIdMap: {} });
    const [domOrder, setDomOrder] = useState<boolean>(false);

    const eGui = useRef<HTMLDivElement>(null);

    useEffect(()=> {
        // const beansToDestroy: any[] = [];

        const compProxy: IRowComp = {
            setDomOrder: domOrder => setDomOrder(domOrder),
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
            setAriaSelected: value => setAriaSelected(value),
            // if we don't maintain the order, then cols will be ripped out and into the dom
            // when cols reordered, which would stop the CSS transitions from working
            setColumns: next => setColumns( prev => maintainOrderOnColumns(prev, next, domOrder) ),
            forEachCellComp: callback => true,
            destroy: ()=> true,
            getCellComp: colId => null,
            getAllCellComps: () => [],
            destroyCells: cellComps => true,
            getFullWidthRowComp: ()=> null,
        };

        rowCtrl.setComp(compProxy, eGui.current!, pinned);

        // return ()=> {
        //     beansToDestroy.forEach( b => context.destroyBean(b) );
        // };

    }, []);

    const rowStyles = {
        height,
        top,
        transform
    };

    _.assign(rowStyles, userStyles);

    const className = cssClasses.toString();

    return (
        <div ref={eGui} role="row" className={className} style={rowStyles} row-index={rowIndex}
             aria-rowindex={ariaRowIndex} aria-expanded={ariaExpanded} aria-label={ariaLabel}
             aria-selected={ariaSelected} row-id={rowId} row-business-key={rowBusinessKey} tabIndex={tabIndex}>
            {
                columns && columns.list.map( col => <CellComp context={context} column={col} rowCtrl={rowCtrl} key={col.getInstanceId()}/>)
            }
        </div>
    );
}