import React, { MutableRefObject, useEffect, useRef, useState, useCallback, RefObject } from 'react';
import {
    Context,
    Component,
    ICellComp,
    CellCtrl,
    UserCompDetails,
    ICellRendererComp,
    _,
} from 'ag-grid-community';
import { CssClasses } from './utils';
import { useJsCellRenderer } from './cellComp/useJsCellRenderer';

export enum CellCompState { ShowValue, EditValue }

const jsxShowValue = (
    rendererCompDetails: UserCompDetails | undefined,
    cellRendererRef: MutableRefObject<any>,
    valueToDisplay: any,
    showTools: boolean,
    toolsRefCallback: (ref:any) => void,
    toolsValueRefCallback: (ref:any) => void
) => {
    const noCellRenderer = !rendererCompDetails;
    const reactCellRenderer = rendererCompDetails && rendererCompDetails.componentFromFramework;
    // const jsCellRenderer = rendererCompDetails && !rendererCompDetails.componentFromFramework;

    const bodyJsxFunc = () => (
        <>
            { noCellRenderer && jsxShowValueNoCellRenderer(valueToDisplay) }
            { reactCellRenderer && jsxShowValueReactCellRenderer(rendererCompDetails!, cellRendererRef) }
            {/* { jsCellRenderer && jsxShowValueJsCellRenderer() } */}
        </>
    );

    return (
        <>
            { showTools && 
                <div className="ag-cell-wrapper" role="presentation" ref={ toolsRefCallback }>
                    <span role="presentation" ref={ toolsValueRefCallback }>
                        { bodyJsxFunc() }
                    </span>
                </div> 
            }
            { !showTools && bodyJsxFunc() }
        </>
    );
}

const jsxEditValue = (editorCompDetails: UserCompDetails | undefined, cellEditorRef: MutableRefObject<any>) => {
    const reactCellRenderer = editorCompDetails && editorCompDetails.componentFromFramework;
    const jsCellRenderer = editorCompDetails && !editorCompDetails.componentFromFramework;

    return (
        <>
            { reactCellRenderer && jsxEditValueReactCellRenderer(editorCompDetails!, cellEditorRef) }
            { jsCellRenderer && jsxEditValueJsCellRenderer() }
        </>
    )
}

const jsxShowValueNoCellRenderer = (valueToDisplay: any) => (
    <>{ valueToDisplay }</>
);


const jsxShowValueReactCellRenderer = (rendererCompDetails: UserCompDetails, cellRendererRef: MutableRefObject<any>) => {
    const CellRendererClass = rendererCompDetails.componentClass;

    return (
        <CellRendererClass { ...rendererCompDetails.params } ref={ cellRendererRef }></CellRendererClass>
    );
}

// const jsxShowValueJsCellRenderer = () => (
//     <>Please write your Cell Renderer as a React Component</>
// );

const jsxEditValueReactCellRenderer = (editorCompDetails: UserCompDetails, cellEditorRef: MutableRefObject<any>) => {
    const CellEditorClass = editorCompDetails.componentClass;

    return (
        <CellEditorClass { ...editorCompDetails.params } ref={ cellEditorRef }></CellEditorClass>
    );
}

const jsxEditValueJsCellRenderer = () => (
    <>Please write your Cell Editor as a React Component</>
);

export const CellComp = (props: {
    cellCtrl: CellCtrl,
    context: Context,
    printLayout: boolean, 
    editingRow: boolean
}) => {
    const { cellCtrl, printLayout, editingRow, context } = props;

    const [cssClasses, setCssClasses] = useState<CssClasses>(new CssClasses());
    const [userStyles, setUserStyles] = useState<any>();

    const [cellState, setCellState] = useState<CellCompState>();

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
    const jsCellRendererRef = useRef<ICellRendererComp|undefined>(null) as MutableRefObject<ICellRendererComp|undefined>;
    const cellEditorRef = useRef<any>(null);

    const [toolsSpan, setToolsSpan] = useState<HTMLElement>();
    const [toolsValueSpan, setToolsValueSpan] = useState<HTMLElement>();

    const showValue = cellState === CellCompState.ShowValue;
    const editValue = cellState === CellCompState.EditValue;

    const showTools = showValue && (includeSelection || includeDndSource || includeRowDrag || forceWrapper);

    useJsCellRenderer(cellState, rendererCompDetails, showTools, toolsValueSpan, context, jsCellRendererRef, eGui);

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
                setCellState(CellCompState.ShowValue);
            },
            editValue: compClassAndParams => {
                setEditorCompDetails(compClassAndParams)
                setRendererCompDetails(undefined);
                setCellState(CellCompState.EditValue);
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

    }, [cellCtrl, editingRow, printLayout, toolsValueSpan]);

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