import React, { useEffect, useRef, useState } from 'react';
import { Context, IRowComp, RowCtrl, _, CellCtrl, UserCompDetails } from 'ag-grid-community';
import { CssClasses } from './utils';
import { CellComp } from './cellComp';
import { createJSComp } from './createJsComp';

interface CellCtrls {
    list: CellCtrl[],
    instanceIdMap: Map<number, CellCtrl>
}

const maintainOrderOnColumns = (prev: CellCtrls, next: CellCtrl[], domOrder: boolean): CellCtrls => {
    if (domOrder) {
        const res: CellCtrls = { list: next, instanceIdMap: new Map() };
        next.forEach(c => res.instanceIdMap.set(c.getInstanceId(), c));

        return res;
    }

    // if dom order not important, we don't want to change the order
    // of the elements in the dom, as this would break transition styles
    const oldCellCtrls: CellCtrl[] = [];
    const newCellCtrls: CellCtrl[] = [];
    const newInstanceIdMap: Map<number, CellCtrl> = new Map();
    const tempMap: Map<number, CellCtrl> = new Map();

    next.forEach(c => tempMap.set(c.getInstanceId(), c));

    prev.list.forEach(c => {
        const instanceId = c.getInstanceId();
        if (tempMap.has(instanceId)) {
            oldCellCtrls.push(c);
            newInstanceIdMap.set(instanceId, c);
        }
    });

    next.forEach(c => {
        const instanceId = c.getInstanceId();
        if (!prev.instanceIdMap.has(instanceId)) {
            newCellCtrls.push(c);
            newInstanceIdMap.set(instanceId, c);
        }
    });

    const res: CellCtrls = {
        list: [...oldCellCtrls, ...newCellCtrls],
        instanceIdMap: newInstanceIdMap
    };

    return res;
}

export const RowComp = (params: {context: Context, rowCtrl: RowCtrl, pinned: string | null}) => {

    const { context, rowCtrl, pinned } = params;

    const [height, setHeight] = useState<string>();
    const [top, setTop] = useState<string | undefined>(rowCtrl.getInitialRowTop());
    const [transform, setTransform] = useState<string | undefined>(rowCtrl.getInitialTransform());
    const [cssClasses, setCssClasses] = useState<CssClasses>(new CssClasses());
    const [rowIndex, setRowIndex] = useState<string>();
    const [rowId, setRowId] = useState<string>();
    const [role, setRole] = useState<string>();
    const [rowBusinessKey, setRowBusinessKey] = useState<string>();
    const [tabIndex, setTabIndex] = useState<number>();
    const [ariaRowIndex, setAriaRowIndex] = useState<number>();
    const [ariaExpanded, setAriaExpanded] = useState<boolean>();
    const [ariaLabel, setAriaLabel] = useState<string>();
    const [ariaSelected, setAriaSelected] = useState<boolean>();
    const [userStyles, setUserStyles] = useState<any>();
    const [cellCtrls, setCellCtrls] = useState<CellCtrls>({ list: [], instanceIdMap: new Map() });
    const [fullWidthCompDetails, setFullWidthCompDetails] = useState<UserCompDetails>();
    const [domOrder, setDomOrder] = useState<boolean>(false);

    const eGui = useRef<HTMLDivElement>(null);
    const fullWidthCompRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!rowCtrl) { return; }

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
            setRole: value => setRole(value),
            // if we don't maintain the order, then cols will be ripped out and into the dom
            // when cols reordered, which would stop the CSS transitions from working
            setCellCtrls: next => setCellCtrls(prev => maintainOrderOnColumns(prev, next, domOrder)),
            showFullWidth: compDetails => setFullWidthCompDetails(compDetails),
            destroy: () => true,
            destroyCells: cellComps => true,
            getFullWidthRowComp: ()=> null,
        };

        rowCtrl.setComp(compProxy, eGui.current!, pinned);
    }, [domOrder, pinned, rowCtrl]);
    
    useEffect(() => {
        return createJSComp(fullWidthCompDetails, context, eGui.current!, 
            compFactory => compFactory.createFullWidthCellRenderer(fullWidthCompDetails!, rowCtrl.getFullWidthCellRendererType()));
    }, [context, fullWidthCompDetails, rowCtrl]);

    const rowStyles = {
        height,
        top,
        transform
    };

    _.assign(rowStyles, userStyles);

    const className = cssClasses.toString();

    const showFullWidthFramework = fullWidthCompDetails && fullWidthCompDetails.componentFromFramework;
    const showCells = cellCtrls != null;
    
    const showCellsJsx = () => cellCtrls.list.map(cellCtrl =>
        (
            <CellComp context={ context } cellCtrl={ cellCtrl }
                        editingRow={ rowCtrl.isEditing() } printLayout={ rowCtrl.isPrintLayout() }
                        key={ cellCtrl.getInstanceId() }/>
        ));

    const showFullWidthFrameworkJsx = () => {
        const FullWidthComp = fullWidthCompDetails!.componentClass;
        return (<FullWidthComp  { ...fullWidthCompDetails!.params } ref={ fullWidthCompRef } />);
    };

    return (
        <div ref={ eGui } role={ role } className={ className } style={ rowStyles } row-index={ rowIndex }
             aria-rowindex={ ariaRowIndex } aria-expanded={ ariaExpanded } aria-label={ ariaLabel }
             aria-selected={ ariaSelected } row-id={ rowId } row-business-key={ rowBusinessKey } tabIndex={ tabIndex }>
            {
                showCells && showCellsJsx()
            }
            {
                showFullWidthFramework && showFullWidthFrameworkJsx() 
            }
        </div>
    );
}