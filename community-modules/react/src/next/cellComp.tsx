import React, { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import {
    Context,
    _,
    ICellComp,
    CellCtrl,
    UserCompDetails
} from "@ag-grid-community/core";
import { CssClasses } from "./utils";

enum CellState {ShowValue, EditValue}

export function CellComp(props: {cellCtrl: CellCtrl, context: Context,
                                printLayout: boolean, editingRow: boolean}) {

    const { cellCtrl, printLayout, editingRow } = props;

    const [cssClasses, setCssClasses] = useState<CssClasses>(new CssClasses());
    const [userStyles, setUserStyles] = useState<any>();

    const [cellState, setCellState] = useState<CellState>();

    const [left, setLeft] = useState<string | undefined>();
    const [width, setWidth] = useState<string | undefined>();
    const [height, setHeight] = useState<string | undefined>();
    const [transition, setTransition] = useState<string | undefined>();
    const [rendererCompDetails, setRendererCompDetails] = useState<UserCompDetails>();
    const [valueToDisplay, setValueToDisplay] = useState<any>();
    const [editorCompDetails, setEditorCompDetails] = useState<UserCompDetails>();
    const [tabIndex, setTabIndex] = useState<number>();
    const [ariaSelected, setAriaSelected] = useState<boolean|undefined>();
    const [ariaColIndex, setAriaColIndex] = useState<number>();
    const [zIndex, setZIndex] = useState<string>();
    const [role, setRole] = useState<string>();
    const [colId, setColId] = useState<string>();
    const [title, setTitle] = useState<string|undefined>();

    const eGui = useRef<HTMLDivElement>(null);
    const cellRendererRef = useRef<any>(null);
    const cellEditorRef = useRef<any>(null);

    useEffect(() => {
        // const beansToDestroy: any[] = [];

        const compProxy: ICellComp = {
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            setUserStyles: styles => setUserStyles(styles),
            setAriaSelected: value => setAriaSelected(value),
            getFocusableElement: () => null as any as HTMLElement, //  this.getFocusableElement(),
            setLeft: left => setLeft(left),
            setWidth: width => setWidth(width),
            setAriaColIndex: index => setAriaColIndex(index),
            setHeight: height => setHeight(height),
            setZIndex: zIndex => setZIndex(zIndex),
            setTabIndex: tabIndex => setTabIndex(tabIndex),
            setRole: role => setRole(role),
            setColId: colId => setColId(colId),
            setTitle: title => setTitle(title),
            setUnselectable: value => false, //  setAttribute('unselectable', value, this.eCellValue),
            setTransition: transition => setTransition(transition),
            showValue: (valueToDisplay, compDetails, force) => {
                setRendererCompDetails(compDetails);
                setValueToDisplay(valueToDisplay);
                setEditorCompDetails(undefined);
                setCellState(CellState.ShowValue);
            },
            editValue: compClassAndParams => {
                setEditorCompDetails(compClassAndParams)
                setRendererCompDetails(undefined);
                setCellState(CellState.EditValue);
            },
            setIncludeSelection: include => false, // this.includeSelection = include,
            setIncludeRowDrag: include => false, // this.includeRowDrag = include,
            setIncludeDndSource: include => false, // this.includeDndSource = include,
            setForceWrapper: force => false, // this.forceWrapper = force,

            getCellEditor: () => cellEditorRef.current,
            getCellRenderer: () => cellRendererRef.current,
            getParentOfValue: () => eGui.current, // this.eCellValue ? this.eCellValue : null,

            // hacks
            addRowDragging: (customElement?: HTMLElement, dragStartPixels?: number) => false, // this.addRowDragging(customElement, dragStartPixels)
        };

        cellCtrl.setComp(compProxy, false, null, eGui.current!, printLayout, editingRow);

        // return () => {
        //     beansToDestroy.forEach(b => context.destroyBean(b));
        // };

    }, []);

    const className = cssClasses.toString();

    const cellStyles = {
        left,
        width,
        height,
        transition,
        "z-index": zIndex
    };

    _.assign(cellStyles, userStyles);

    const showValue = cellState === CellState.ShowValue;
    const showValueNoCellRenderer = showValue && !rendererCompDetails;
    const showValueReactCellRenderer = showValue && rendererCompDetails && rendererCompDetails.componentFromFramework;
    const showValueJsCellRenderer = showValue && rendererCompDetails && !rendererCompDetails.componentFromFramework;

    const editValue = cellState === CellState.EditValue;
    const editValueReactCellRenderer = editValue && editorCompDetails && editorCompDetails.componentFromFramework;
    const editValueJsCellRenderer = editValue && editorCompDetails && !editorCompDetails.componentFromFramework;

    return (
        <div ref={ eGui } className={ className } style={ cellStyles } tabIndex={tabIndex}
             aria-selected={ariaSelected} aria-colindex={ariaColIndex} role={role}
             col-id={colId} title={title}>
            { showValueNoCellRenderer && jsxShowValueNoCellRenderer(valueToDisplay) }
            { showValueReactCellRenderer && jsxShowValueReactCellRenderer(rendererCompDetails!, cellRendererRef) }
            { showValueJsCellRenderer && jsxShowValueJsCellRenderer() }
            { editValueReactCellRenderer && jsxEditValueReactCellRenderer(editorCompDetails!, cellEditorRef) }
            { editValueJsCellRenderer && jsxEditValueJsCellRenderer() }
        </div>
    );
}

function jsxShowValueNoCellRenderer(valueToDisplay: any) {
    return (
        <>{valueToDisplay}</>
    );
}

function jsxShowValueReactCellRenderer(rendererCompDetails: UserCompDetails, cellRendererRef: MutableRefObject<any>) {
    const CellRendererClass = rendererCompDetails.componentClass;
    return (
        <CellRendererClass {...rendererCompDetails.params} ref={cellRendererRef}></CellRendererClass>
    );
}

function jsxShowValueJsCellRenderer() {
    return (<>Please write your Cell Renderer as a React Component</>);
}

function jsxEditValueReactCellRenderer(editorCompDetails: UserCompDetails, cellEditorRef: MutableRefObject<any>) {
    const CellEditorClass = editorCompDetails.componentClass;
    return (
        <CellEditorClass {...editorCompDetails.params} ref={cellEditorRef}></CellEditorClass>
    );
}

function jsxEditValueJsCellRenderer() {
    return (<>Please write yoru Cell Editor as a React Component</>);
}