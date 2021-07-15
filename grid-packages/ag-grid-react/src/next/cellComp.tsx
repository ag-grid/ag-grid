import React, { MutableRefObject, useEffect, useRef, useState, useCallback } from 'react';
import {
    Context,
    Component,
    ICellComp,
    CellCtrl,
    UserCompDetails,
    ICellRendererComp,
    _
} from 'ag-grid-community';
import { CssClasses } from './utils';
import { useJsCellRenderer } from './cellComp/useJsCellRenderer';
import { createJSComp } from './createJsComp';

export enum CellCompState { ShowValue, EditValue }


const jsxEditValue = (editorCompDetails: UserCompDetails | undefined, cellEditorRef: MutableRefObject<any>) => {
    const reactCellRenderer = editorCompDetails && editorCompDetails.componentFromFramework;

    return (
        <>
            { reactCellRenderer && jsxEditValueReactCellRenderer(editorCompDetails!, cellEditorRef) }
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

const jsxEditValueReactCellRenderer = (editorCompDetails: UserCompDetails, cellEditorRef: MutableRefObject<any>) => {
    const CellEditorClass = editorCompDetails.componentClass;

    return (
        <CellEditorClass { ...editorCompDetails.params } ref={ cellEditorRef }></CellEditorClass>
    );
}

const jsxShowValue = (
    parentId: number,
    rendererCompDetails: UserCompDetails | undefined,
    cellRendererRef: MutableRefObject<any>,
    valueToDisplay: any,
    showTools: boolean,
    unselectable: 'on' | undefined,
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
        </>
    );

    return (
        <>
            { showTools ?
                <div className="ag-cell-wrapper" role="presentation" ref={ toolsRefCallback }>
                    <span role="presentation" id={`cell-${parentId}`} className="ag-cell-value" unselectable={ unselectable } ref={ toolsValueRefCallback }>
                        { bodyJsxFunc() }
                    </span>
                </div> :
                bodyJsxFunc()
            }
        </>
    );
}

export interface RenderDetails {
    edit: boolean;
    compDetails: UserCompDetails | undefined;
    value?: any;
    force?: boolean;
}

export const CellComp = (props: {
    cellCtrl: CellCtrl,
    context: Context,
    printLayout: boolean, 
    editingRow: boolean
}) => {
    const { cellCtrl, printLayout, editingRow, context } = props;

    const [cssClasses, setCssClasses] = useState<CssClasses>(new CssClasses());
    const [userStyles, setUserStyles] = useState<any>();
    const [unselectable, setUnselectable] = useState<'on' | undefined>('on');
    const [renderDetails, setRenderDetails] = useState<RenderDetails>();
    const [left, setLeft] = useState<string | undefined>();
    const [width, setWidth] = useState<string | undefined>();
    const [height, setHeight] = useState<string | undefined>();
    const [transition, setTransition] = useState<string | undefined>();
    const [tabIndex, setTabIndex] = useState<number>();
    const [ariaSelected, setAriaSelected] = useState<boolean | undefined>();
    const [ariaColIndex, setAriaColIndex] = useState<number>();
    const [ariaDescribedBy, setAriaDescribedBy] = useState<string | undefined>();
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
    const jsCellRendererRef = useRef<ICellRendererComp>();
    const cellEditorRef = useRef<any>(null);

    const [toolsSpan, setToolsSpan] = useState<HTMLElement>();
    const [toolsValueSpan, setToolsValueSpan] = useState<HTMLElement>();

    const showValue = renderDetails!=null && !renderDetails.edit;
    const editValue = renderDetails!=null && renderDetails.edit;
    
    const showTools = showValue && (includeSelection || includeDndSource || includeRowDrag || forceWrapper);

    useJsCellRenderer(renderDetails, showTools, toolsValueSpan, context, jsCellRendererRef, eGui);

    useEffect(() => {
        const editorCompDetails = (renderDetails && renderDetails.edit) ? renderDetails.compDetails : undefined;
        return createJSComp(editorCompDetails, context, eGui.current!, 
            compFactory => compFactory.createCellEditor(editorCompDetails!), cellEditorRef);
    }, [context, renderDetails]);

    // tool widgets effect
    useEffect(() => {
        if (!cellCtrl || !context) { return; }

        setAriaDescribedBy(!!toolsSpan ? `cell-${cellCtrl.getInstanceId()}` : undefined);

        if (!toolsSpan) { return; }

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
            getFocusableElement: () => eGui.current!,
            setLeft: left => setLeft(left),
            setWidth: width => setWidth(width),
            setAriaColIndex: index => setAriaColIndex(index),
            setHeight: height => setHeight(height),
            setZIndex: zIndex => setZIndex(zIndex),
            setTabIndex: tabIndex => setTabIndex(tabIndex),
            setRole: role => setRole(role),
            setColId: colId => setColId(colId),
            setTitle: title => setTitle(title),
            setUnselectable: value => setUnselectable(value || undefined),
            setTransition: transition => setTransition(transition),
            showValue: (valueToDisplay, compDetails, force) => {
                setRenderDetails({
                    compDetails: compDetails,
                    edit: false,
                    value: valueToDisplay,
                    force: force
                });
            },
            editValue: compDetails => {
                setRenderDetails({
                    compDetails: compDetails,
                    edit: true
                });
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
        cellCtrl.updateCssCellValue();

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
             col-id={ colId } title={ title } unselectable={ unselectable } aria-describedby={ ariaDescribedBy }>

            { showValue && jsxShowValue(cellCtrl.getInstanceId(), renderDetails!.compDetails, cellRendererRef, renderDetails!.value, showTools, unselectable, toolsRefCallback, toolsValueRefCallback) }
            { editValue && jsxEditValue(renderDetails!.compDetails, cellEditorRef) }

        </div>
    );
}