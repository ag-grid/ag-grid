import React, { useEffect, useRef, useState, useMemo, memo, useContext } from 'react';
import { CellCtrl, IRowComp, RowCtrl, UserCompDetails, _, ICellRenderer } from 'ag-grid-community';
import { showJsComp } from '../jsComp';
import { CssClasses, isComponentStateless } from '../utils';
import { BeansContext } from '../beansContext';
import CellComp from '../cells/cellComp';

interface CellCtrls {
    list: CellCtrl[],
    instanceIdMap: Map<string, CellCtrl>
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
    const newInstanceIdMap: Map<string, CellCtrl> = new Map();
    const tempMap: Map<string, CellCtrl> = new Map();

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

const RowComp = (params: {rowCtrl: RowCtrl, pinned: string | null}) => {

    const {context} = useContext(BeansContext);

    const { rowCtrl, pinned } = params;

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
    const [display, setDisplay] = useState<string>();

    const eGui = useRef<HTMLDivElement>(null);
    const fullWidthCompRef = useRef<ICellRenderer>();

    useEffect(() => {
        const compProxy: IRowComp = {
            setDisplay: value => setDisplay(value),
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
            getFullWidthCellRenderer: ()=> fullWidthCompRef.current,
        };
        rowCtrl.setComp(compProxy, eGui.current!, pinned);
    }, []);

    useEffect(() => {
        return showJsComp(fullWidthCompDetails, context, eGui.current!, fullWidthCompRef);
    }, [fullWidthCompDetails]);

    const rowStyles = useMemo(() => {
        const res = {
            height,
            top,
            transform,
            display
        };
        Object.assign(res, userStyles);
        return res;
    }, [height, top, transform, userStyles, display]);

    const className = useMemo( ()=> cssClasses.toString(), [cssClasses]);

    const showFullWidthFramework = fullWidthCompDetails && fullWidthCompDetails.componentFromFramework;
    const showCells = cellCtrls != null;
    
    const reactFullWidthCellRendererStateless = useMemo( ()=> {
        const res = fullWidthCompDetails 
                    && fullWidthCompDetails.componentFromFramework 
                    && isComponentStateless(fullWidthCompDetails.componentClass);
        return !!res;
    }, [fullWidthCompDetails]);

    const showCellsJsx = () => cellCtrls.list.map(cellCtrl =>
        (
            <CellComp cellCtrl={ cellCtrl }
                        editingRow={ rowCtrl.isEditing() } printLayout={ rowCtrl.isPrintLayout() }
                        key={ cellCtrl.getInstanceId() }/>
        ));

    const showFullWidthFrameworkJsx = () => {
        const FullWidthComp = fullWidthCompDetails!.componentClass;
        return (
            <>
                {
                    reactFullWidthCellRendererStateless 
                    && <FullWidthComp  { ...fullWidthCompDetails!.params } />
                }
                {
                    !reactFullWidthCellRendererStateless 
                    && <FullWidthComp  { ...fullWidthCompDetails!.params } ref={ fullWidthCompRef } />
                }
            </>
        );
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
};

export default memo(RowComp);
