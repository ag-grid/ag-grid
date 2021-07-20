import React, { MutableRefObject, useEffect, useRef, useState, useCallback } from 'react';
import {
    Context,
    Component,
    ICellComp,
    CellCtrl,
    UserCompDetails,
    ICellRendererComp,
    _
} from '@ag-grid-community/core';
import { CssClasses } from '../utils';
import { showJsCellRenderer as showJsRenderer } from './showJsRenderer';
import { JsEditorComp } from './jsEditorComp';
import { PopupEditorComp } from './popupEditorComp';

export enum CellCompState { ShowValue, EditValue }

const jsxEditValue = (editDetails: EditDetails, cellEditorRef: MutableRefObject<any>, context: Context, eGui: HTMLElement, 
    cellCtrl: CellCtrl ) => {

    const compDetails = editDetails.compDetails;

    const reactInlineEditor = compDetails.componentFromFramework && !editDetails.popup;
    const reactPopupEditor = compDetails.componentFromFramework && editDetails.popup;
    const jsInlineEditor = !compDetails.componentFromFramework && !editDetails.popup;
    const jsPopupEditor = !compDetails.componentFromFramework && editDetails.popup;

    const CellEditorClass = compDetails.componentClass;

    return (
        <>
            { reactInlineEditor && jsxEditValueReactCellRenderer(compDetails, cellEditorRef) }
            { reactPopupEditor && <PopupEditorComp editDetails={editDetails} cellCtrl={cellCtrl} eParentCell={eGui}
                            wrappedContent={ <CellEditorClass { ...editDetails.compDetails.params } ref={ cellEditorRef }/> }/> }
            { jsInlineEditor && <JsEditorComp cellEditorRef={cellEditorRef} eParentElement={eGui} 
                            compDetails={compDetails} context={context} /> }
            { jsPopupEditor && <PopupEditorComp editDetails={editDetails} cellCtrl={cellCtrl} eParentCell={eGui}
                            wrappedComp={ JsEditorComp } wrappedCompProps={{context, compDetails, cellEditorRef}}/> }
        </>
    )
}

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
    showDetails: ShowDetails,
    parentId: number,
    cellRendererRef: MutableRefObject<any>,
    showTools: boolean,
    unselectable: 'on' | undefined,
    toolsRefCallback: (ref:any) => void,
    toolsValueRefCallback: (ref:any) => void
) => {
    const {compDetails, value} = showDetails;

    const noCellRenderer = !compDetails;
    const reactCellRenderer = compDetails && compDetails.componentFromFramework;

    const bodyJsxFunc = () => (
        <>
            { noCellRenderer && <>{ value }</> }
            { reactCellRenderer && jsxShowValueReactCellRenderer(compDetails!, cellRendererRef) }
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

export interface ShowDetails {
    compDetails: UserCompDetails | undefined;
    value?: any;
    force?: boolean;
}
export interface EditDetails {
    compDetails: UserCompDetails;
    popup?: boolean;
    popupPosition?: string;
}

export const CellComp = (props: {
    cellCtrl: CellCtrl,
    context: Context,
    printLayout: boolean, 
    editingRow: boolean
}) => {
    const { cellCtrl, printLayout, editingRow, context } = props;

    const [showDetails, setShowDetails ] = useState<ShowDetails>();
    const [editDetails, setEditDetails ] = useState<EditDetails>();

    const [cssClasses, setCssClasses] = useState<CssClasses>(new CssClasses());
    const [userStyles, setUserStyles] = useState<any>();
    const [unselectable, setUnselectable] = useState<'on' | undefined>('on');
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
    
    const showTools = showDetails!=null && (includeSelection || includeDndSource || includeRowDrag || forceWrapper);

    showJsRenderer(showDetails, showTools, toolsValueSpan, context, jsCellRendererRef, eGui);

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
            showValue: (value, compDetails, force) => {
                setShowDetails({
                    compDetails,
                    value,
                    force
                });
                setEditDetails(undefined);
            },
            editValue: (compDetails, popup, popupPosition) => {
                setEditDetails({
                    compDetails,
                    popup,
                    popupPosition
                });
                if (!popup) {
                    setShowDetails(undefined);
                }
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

            { showDetails!=null && jsxShowValue(showDetails, cellCtrl.getInstanceId(), cellRendererRef, showTools, unselectable, toolsRefCallback, toolsValueRefCallback) }
            { editDetails!=null && jsxEditValue(editDetails, cellEditorRef, context, eGui.current!, cellCtrl) }

        </div>
    );
}