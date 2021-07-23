import { CellCtrl, Component, Context, ICellComp, ICellEditor, ICellRendererComp, UserCompDetails, _ } from 'ag-grid-community';
import React, { MutableRefObject, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { CssClasses, isComponentStateless } from '../utils';
import JsEditorComp from './jsEditorComp';
import PopupEditorComp from './popupEditorComp';
import useJsCellRenderer from './showJsRenderer';

export enum CellCompState { ShowValue, EditValue }

const checkCellEditorDeprecations = (popup: boolean, cellEditor: ICellEditor, cellCtrl: CellCtrl) => {

    const col = cellCtrl.getColumn();

    // cellEditor is written to be a popup editor, however colDef.cellEditorPopup is not set
    if (!popup && cellEditor.isPopup && cellEditor.isPopup()) {
        const msg = `AG Grid: Found an issue in column ${col.getColId()}. If using ReactUI, specify an editor is a popup using colDef.cellEditorPopup=true`;
        _.doOnce(() => console.warn(msg), 'jsEditorComp-isPopup-' + cellCtrl.getColumn().getColId());
    }

    // cellEditor is a popup and is trying to position itself the deprecated way
    if (popup && cellEditor.getPopupPosition && cellEditor.getPopupPosition()!=null) {
        const msg = `AG Grid: AG Grid: Found an issue in column ${col.getColId()}. If using ReactUI, specify an editor popup position using colDef.cellEditorPopupPosition=[value]`;
        _.doOnce(() => console.warn(msg), 'jsEditorComp-getPopupPosition-' + cellCtrl.getColumn().getColId());
    }
}

const jsxEditValue = (
        editDetails: EditDetails, 
        setInlineCellEditorRef: (cellEditor: ICellEditor | undefined)=>void,
        setPopupCellEditorRef: (cellEditor: ICellEditor | undefined)=>void,
        eGui: HTMLElement, 
        cellCtrl: CellCtrl ) => {

    const compDetails = editDetails.compDetails;
    const CellEditorClass = compDetails.componentClass;

    const reactInlineEditor = compDetails.componentFromFramework && !editDetails.popup;
    const reactPopupEditor = compDetails.componentFromFramework && editDetails.popup;
    const jsInlineEditor = !compDetails.componentFromFramework && !editDetails.popup;
    const jsPopupEditor = !compDetails.componentFromFramework && editDetails.popup;

    return (
        <>

            { 
                reactInlineEditor 
                && <CellEditorClass { ...editDetails.compDetails.params } ref={ setInlineCellEditorRef }/> 
            }

            { 
                reactPopupEditor 
                && <PopupEditorComp editDetails={editDetails} cellCtrl={cellCtrl} eParentCell={eGui}
                            wrappedContent={ 
                                <CellEditorClass { ...editDetails.compDetails.params } ref={ setPopupCellEditorRef }/> 
                            }/> 
            }

            { 
                jsInlineEditor 
                && <JsEditorComp setCellEditorRef={ setInlineCellEditorRef } eParentElement={eGui} 
                            compDetails={compDetails} cellCtrl={cellCtrl}/> 
            }

            { 
                jsPopupEditor && <PopupEditorComp editDetails={editDetails} cellCtrl={cellCtrl} 
                            eParentCell={eGui} wrappedComp={ JsEditorComp } 
                            wrappedCompProps={{cellCtrl, compDetails, setCellEditorRef: setPopupCellEditorRef }}/> 
            }
        </>
    )
}

const jsxShowValue = (
    showDetails: RenderDetails,
    parentId: string,
    cellRendererRef: MutableRefObject<any>,
    showTools: boolean,
    unSelectable: 'on' | undefined,
    reactCellRendererStateless: boolean,
    toolsRefCallback: (ref:any) => void,
    toolsValueRefCallback: (ref:any) => void
) => {
    const {compDetails, value} = showDetails;

    const noCellRenderer = !compDetails;
    const reactCellRenderer = compDetails && compDetails.componentFromFramework;

    const CellRendererClass = compDetails && compDetails.componentClass;

    const bodyJsxFunc = () => (
        <>
            { noCellRenderer && <>{ value }</> }
            { reactCellRenderer && reactCellRendererStateless && <CellRendererClass { ...compDetails!.params } ref={ cellRendererRef }/> }
            { reactCellRenderer && !reactCellRendererStateless && <CellRendererClass { ...compDetails!.params }/> }
        </>
    );

    return (
        <>
            { showTools ?
                <div className="ag-cell-wrapper" role="presentation" ref={ toolsRefCallback }>
                    <span role="presentation" id={`cell-${parentId}`} className="ag-cell-value" unselectable={ unSelectable } ref={ toolsValueRefCallback }>
                        { bodyJsxFunc() }
                    </span>
                </div> :
                bodyJsxFunc()
            }
        </>
    );
}

export interface RenderDetails {
    compDetails: UserCompDetails | undefined;
    value?: any;
    force?: boolean;
}
export interface EditDetails {
    compDetails: UserCompDetails;
    popup?: boolean;
    popupPosition?: string;
}

const CellComp = (props: {
    cellCtrl: CellCtrl,
    context: Context,
    printLayout: boolean, 
    editingRow: boolean
}) => {
    const { cellCtrl, printLayout, editingRow, context } = props;

    const [renderDetails, setRenderDetails ] = useState<RenderDetails>();
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
    const cellEditorRef = useRef<ICellEditor>();

    const [toolsSpan, setToolsSpan] = useState<HTMLElement>();
    const [toolsValueSpan, setToolsValueSpan] = useState<HTMLElement>();
    
    const showTools = renderDetails!=null && (includeSelection || includeDndSource || includeRowDrag || forceWrapper);

    const setCellEditorRef = useCallback( (popup: boolean, cellEditor: ICellEditor | undefined) => {
        cellEditorRef.current = cellEditor;
        if (cellEditor) {
            checkCellEditorDeprecations(popup, cellEditor, cellCtrl);
            const editingCancelledByUserComp = cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart();
            if (editingCancelledByUserComp) {
                // we cannot set state inside render, so hack is to do it in next VM turn
                setTimeout( ()=> cellCtrl.stopEditing(), 0);
            }
        }
    }, []);

    const setPopupCellEditorRef = useCallback( 
        (cellRenderer: ICellEditor | undefined) => setCellEditorRef(true, cellRenderer),
        []
    );

    const setInlineCellEditorRef = useCallback(
        (cellRenderer: ICellEditor | undefined) => setCellEditorRef(false, cellRenderer), 
        []
    );

    useJsCellRenderer(renderDetails, showTools, toolsValueSpan, context, jsCellRendererRef, eGui);

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

    }, [includeDndSource, includeRowDrag, includeSelection, toolsSpan]);

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
            setIncludeSelection: include => setIncludeSelection(include),
            setIncludeRowDrag: include => setIncludeRowDrag(include),
            setIncludeDndSource: include => setIncludeDndSource(include),
            setForceWrapper: force => setForceWrapper(force),
            
            getCellEditor: () => cellEditorRef.current || null,
            getCellRenderer: () => cellRendererRef.current ? cellRendererRef.current : jsCellRendererRef.current,
            getParentOfValue: () => toolsValueSpan ? toolsValueSpan : eGui.current,

            setRenderDetails: (compDetails, value, force) => {
                setRenderDetails({
                    value,
                    compDetails,
                    force
                });
            },
            
            setEditDetails: (compDetails, popup, popupPosition) => {
                if (compDetails) {
                    // start editing
                    setEditDetails({
                        compDetails: compDetails!,
                        popup,
                        popupPosition
                    });
                    if (!popup) {
                        setRenderDetails(undefined);
                    }
                } else {
                    // stop editing
                    setEditDetails(undefined);
                }
            }
        };

        cellCtrl.setComp(compProxy, false, null, eGui.current!, printLayout, editingRow);

    }, []);

    const reactCellRendererStateless = useMemo( ()=> {
        const res = renderDetails && renderDetails.compDetails 
                    && renderDetails.compDetails.componentFromFramework 
                    && isComponentStateless(renderDetails.compDetails.componentClass);
        return !!res;
    }, [renderDetails]);

    let className = cssClasses.toString();

    if (!showTools) {
        className += ' ag-cell-value';
    }

    const cellStyles: React.CSSProperties = {
        left,
        width,
        height,
        transition,
        zIndex: (zIndex as any)
    };

    _.assign(cellStyles, userStyles);

    return (
        <div ref={ eGui } className={ className } style={ cellStyles } tabIndex={ tabIndex }
             aria-selected={ ariaSelected } aria-colindex={ ariaColIndex } role={ role }
             col-id={ colId } title={ title } unselectable={ unselectable } aria-describedby={ ariaDescribedBy }>


            { renderDetails != null && jsxShowValue(renderDetails, cellCtrl.getInstanceId(), cellRendererRef, 
                                                showTools, unselectable, reactCellRendererStateless,
                                                toolsRefCallback, toolsValueRefCallback) }
            { editDetails != null && jsxEditValue(editDetails, setInlineCellEditorRef, setPopupCellEditorRef, eGui.current!, cellCtrl) }


        </div>
    );
}

export default CellComp;