import React, { MutableRefObject, useEffect, useRef, useState, useCallback, RefObject } from 'react';
import {
    Context,
    Component,
    ICellComp,
    CellCtrl,
    UserCompDetails,
    _,
    UserComponentFactory,
} from 'ag-grid-community';
import { CssClasses } from './utils';


enum CellState { ShowValue, EditValue }

export function CellComp(props: {
    cellCtrl: CellCtrl,
    context: Context,
    printLayout: boolean, 
    editingRow: boolean
}) {
    const { cellCtrl, printLayout, editingRow, context } = props;

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
    const [ariaSelected, setAriaSelected] = useState<boolean | undefined>();
    const [ariaColIndex, setAriaColIndex] = useState<number>();
    const [zIndex, setZIndex] = useState<string>();
    const [role, setRole] = useState<string>();
    const [colId, setColId] = useState<string>();
    const [title, setTitle] = useState<string | undefined>();
    const [includeSelection, setIncludeSelection] = useState<boolean>(false);
    const [includeRowDrag, setIncludeRowDrag] = useState<boolean>(false);
    const [includeDndSource, setIncludeDndSource] = useState<boolean>(false);
    const [forceWrapper, setForceWrapper] = useState<boolean>(false);

    const eGui = useRef<HTMLDivElement>(null);
    const cellRendererRef = useRef<any>(null);
    const jsCellRendererRef = useRef<any>(null);
    const cellEditorRef = useRef<any>(null);

    const [toolsSpan, setToolsSpan] = useState<HTMLElement>();
    const [toolsValueSpan, setToolsValueSpan] = useState<HTMLElement>();

    const showValue = cellState === CellState.ShowValue;
    const editValue = cellState === CellState.EditValue;

    const showTools = showValue && (includeSelection || includeDndSource || includeRowDrag || forceWrapper);

    // tool widgets effect
    useEffect(() => {
        if (!toolsSpan || !cellCtrl || !context) { return; }

        const beansToDestroy: any[] = [];

        const addComp = (comp: Component | undefined) => {
            if (comp) {
                toolsSpan.insertAdjacentElement('afterbegin', comp.getGui());
                beansToDestroy.push(comp);
            }
            return comp;
        }

        if (includeSelection) {
            addComp(cellCtrl.createSelectionCheckbox());
        }

        if (includeDndSource) {
            addComp(cellCtrl.createDndSource());
        }

        if (includeRowDrag) {
            addComp(cellCtrl.createRowDragComp());
        }

        return () => {
            context.destroyBeans(beansToDestroy);
        };

    }, [cellCtrl, context, includeDndSource, includeRowDrag, includeSelection, toolsSpan]);

    // attaching the ref to state makes sure we render again when state is set. this is
    // how we make sure the tools are added, as it's not possible to have an effect depend
    // on a reference, as reference is not state, it doesn't create another render cycle.
    const toolsRefCallback = useCallback(ref => setToolsSpan(ref), []);
    const toolsValueRefCallback = useCallback(ref => setToolsValueSpan(ref), []);

    // show vanilla JS cell renderer
    useEffect( ()=> {

        if (!showValue) { return; } // do nothing if editing

        if (!rendererCompDetails || rendererCompDetails.componentFromFramework) { return; } // do nothing if not using js cell renderer

        if (showTools && toolsValueSpan==null) { return; } // ui for tools not yet set up

        const compFactory = context.getBean('userComponentFactory') as UserComponentFactory;
        const promise = compFactory.createCellRenderer(rendererCompDetails);
        if (!promise) { return; }

        const comp = promise.resolveNow(null, x => x); // js comps are never async
        if (!comp) { return; }

        const compGui = comp.getGui();
        const parent = showTools ? toolsValueSpan! : eGui.current!;
        parent.appendChild(compGui);

        jsCellRendererRef.current = comp;

        return () => {
            if (compGui.parentElement) {
                compGui.parentElement.removeChild(compGui);
            }
            context.destroyBean(comp);
            jsCellRendererRef.current = undefined;
        };

    }, [cellState, toolsValueSpan]);

    useEffect(() => {
        if (!cellCtrl) { return; }

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
            setIncludeRowDrag: include => setIncludeRowDrag(include),
            setIncludeDndSource: include => setIncludeDndSource(include),
            setForceWrapper: force => setForceWrapper(force),

            getCellEditor: () => cellEditorRef.current,
            getCellRenderer: () => cellRendererRef.current,
            getParentOfValue: () => toolsValueSpan ? toolsValueSpan : eGui.current
        };

        cellCtrl.setComp(compProxy, false, null, eGui.current!, printLayout, editingRow);

    }, [cellCtrl, editingRow, printLayout]);

    const className = cssClasses.toString();

    const cellStyles = {
        left,
        width,
        height,
        transition,
        'z-index': zIndex
    };

    _.assign(cellStyles, userStyles);

    return (
        <div ref={ eGui } className={ className } style={ cellStyles } tabIndex={ tabIndex }
             aria-selected={ ariaSelected } aria-colindex={ ariaColIndex } role={ role }
             col-id={ colId } title={ title }>

            { showValue && jsxShowValue(rendererCompDetails, cellRendererRef, valueToDisplay, showTools, toolsRefCallback, toolsValueRefCallback) }
            { editValue && jsxEditValue(editorCompDetails, cellEditorRef) }

        </div>
    );
}

function jsxShowValue(
    rendererCompDetails: UserCompDetails | undefined,
    cellRendererRef: MutableRefObject<any>,
    valueToDisplay: any,
    showTools: boolean,
    toolsRefCallback: (ref:any) => void,
    toolsValueRefCallback: (ref:any) => void
) {
    const noCellRenderer = !rendererCompDetails;
    const reactCellRenderer = rendererCompDetails && rendererCompDetails.componentFromFramework;
    const jsCellRenderer = rendererCompDetails && !rendererCompDetails.componentFromFramework;

    const bodyJsxFunc = () => (
        <>
            { noCellRenderer && jsxShowValueNoCellRenderer(valueToDisplay) }
            { reactCellRenderer && jsxShowValueReactCellRenderer(rendererCompDetails!, cellRendererRef) }
            {/* { jsCellRenderer && jsxShowValueJsCellRenderer() } */}
        </>
    );

    ///////// Need to fix unselectable=on, should be set by the ctrl
    return (
        <>
            { showTools && 
                <div className="ag-cell-wrapper" role="presentation" ref={ toolsRefCallback }>
                    <span role="presentation" className={ 'ag-cell-value' } unselectable="on" ref={ toolsValueRefCallback }>
                        { bodyJsxFunc() }
                    </span>
                </div> 
            }
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
        <>{ valueToDisplay }</>
    );
}

function jsxShowValueReactCellRenderer(rendererCompDetails: UserCompDetails, cellRendererRef: MutableRefObject<any>) {
    const CellRendererClass = rendererCompDetails.componentClass;

    return (
        <CellRendererClass { ...rendererCompDetails.params } ref={ cellRendererRef }></CellRendererClass>
    );
}

function jsxShowValueJsCellRenderer() {
    return (<>Please write your Cell Renderer as a React Component</>);
}

function jsxEditValueReactCellRenderer(editorCompDetails: UserCompDetails, cellEditorRef: MutableRefObject<any>) {
    const CellEditorClass = editorCompDetails.componentClass;

    return (
        <CellEditorClass { ...editorCompDetails.params } ref={ cellEditorRef }></CellEditorClass>
    );
}

function jsxEditValueJsCellRenderer() {
    return (<>Please write your Cell Editor as a React Component</>);
}