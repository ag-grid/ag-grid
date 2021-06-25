import React, { MutableRefObject, useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
    Context,
    _,
    ICellComp,
    CellCtrl,
    CellTools,
    UserCompDetails, CheckboxSelectionComponent
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
    const [includeSelection, setIncludeSelection] = useState<boolean>();

    const eGui = useRef<HTMLDivElement>(null);
    const cellRendererRef = useRef<any>(null);
    const cellEditorRef = useRef<any>(null);

    const [toolsSpan, setToolsSpan] = useState<HTMLElement>();

    useEffect( ()=> {
        if (!toolsSpan) { return; }

        const comp = new CellTools().createSelectionCheckbox(
            cellCtrl.getRowNode(), cellCtrl.getColumn(), cellCtrl.getBeans());

        toolsSpan.insertAdjacentElement('afterbegin', comp.getGui());

        return ()=> {
            props.context.destroyBean(comp);
        };

    }, [toolsSpan, includeSelection]);

    // attaching the ref to state makes sure we render again when state is set. this is
    // how we make sure the tools are added, as it's not possible to have an effect depend
    // on a reference, as reference is not state, it doesn't create another render cycle.
    const toolsCallback = useCallback( ref => setToolsSpan(ref), []);

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
            setIncludeSelection: include => setIncludeSelection(include),
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
    const editValue = cellState === CellState.EditValue;

    const showTools = !!includeSelection;

    return (
        <div ref={ eGui } className={ className } style={ cellStyles } tabIndex={tabIndex}
             aria-selected={ariaSelected} aria-colindex={ariaColIndex} role={role}
             col-id={colId} title={title}>

            { showValue && jsxShowValue(rendererCompDetails, cellRendererRef, valueToDisplay, showTools, toolsCallback) }
            { editValue && jsxEditValue(editorCompDetails, cellEditorRef) }

        </div>
    );
}

function jsxShowValue(
            rendererCompDetails: UserCompDetails | undefined, cellRendererRef: MutableRefObject<any>, valueToDisplay: any,
            showTools: boolean,
            toolsCallback: (ref:any)=>void
            ) {
    const noCellRenderer = !rendererCompDetails;
    const reactCellRenderer = rendererCompDetails && rendererCompDetails.componentFromFramework;
    const jsCellRenderer = rendererCompDetails && !rendererCompDetails.componentFromFramework;

    const bodyJsxFunc = ()=> (<>
            { noCellRenderer && jsxShowValueNoCellRenderer(valueToDisplay) }
            { reactCellRenderer && jsxShowValueReactCellRenderer(rendererCompDetails!, cellRendererRef) }
            { jsCellRenderer && jsxShowValueJsCellRenderer() }
        </>);

    ///////// Need to fix unselectable=on, should be set by the ctrl
    return (
        <>
            { showTools && <div className="ag-cell-wrapper" role="presentation" ref={toolsCallback}>
                                <span role="presentation" className={"ag-cell-value"} unselectable="on">
                                    {bodyJsxFunc()}
                                </span>
                            </div> }
            { !showTools && bodyJsxFunc() }
        </>
    );
}

function jsxEditValue(editorCompDetails: UserCompDetails | undefined, cellEditorRef: MutableRefObject<any>) {
    const reactCellRenderer = editorCompDetails && editorCompDetails.componentFromFramework;
    const jsCellRenderer = editorCompDetails && !editorCompDetails.componentFromFramework;
    return (
        <>
            { reactCellRenderer && jsxEditValueReactCellRenderer(editorCompDetails!, cellEditorRef) }
            { jsCellRenderer && jsxEditValueJsCellRenderer() }
        </>
    )
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