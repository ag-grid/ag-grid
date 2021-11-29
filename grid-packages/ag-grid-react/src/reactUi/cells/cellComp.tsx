import { CellCtrl, Component, ICellComp, ICellEditor, ICellRendererComp, UserCompDetails, _, ICellEditorComp } from 'ag-grid-community';
import React, { MutableRefObject, useCallback, useEffect, useRef, useState, useMemo, memo, useContext } from 'react';
import { CssClasses, isComponentStateless } from '../utils';
import PopupEditorComp from './popupEditorComp';
import useJsCellRenderer from './showJsRenderer';
import { BeansContext } from '../beansContext';
import { createJsComp } from '../jsComp';

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
        cellCtrl: CellCtrl,
        jsEditorComp: ICellEditorComp | undefined ) => {

    const compDetails = editDetails.compDetails;
    const CellEditorClass = compDetails.componentClass;

    const reactInlineEditor = compDetails.componentFromFramework && !editDetails.popup;
    const reactPopupEditor = compDetails.componentFromFramework && editDetails.popup;
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
                jsPopupEditor && jsEditorComp && <PopupEditorComp editDetails={editDetails} cellCtrl={cellCtrl} 
                            eParentCell={eGui} jsChildComp={ jsEditorComp } /> 
            }
        </>
    )
}

const jsxShowValue = (
    showDetails: RenderDetails,
    parentId: string,
    cellRendererRef: MutableRefObject<any>,
    showTools: boolean,
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
            { reactCellRenderer && !reactCellRendererStateless && <CellRendererClass { ...compDetails!.params } ref={ cellRendererRef }/> }
            { reactCellRenderer && reactCellRendererStateless && <CellRendererClass { ...compDetails!.params }/> }
        </>
    );

    return (
        <>
            { showTools ?
                <div className="ag-cell-wrapper" role="presentation" ref={ toolsRefCallback }>
                    <span role="presentation" id={`cell-${parentId}`} className="ag-cell-value" ref={ toolsValueRefCallback }>
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
    printLayout: boolean, 
    editingRow: boolean
}) => {

    const {context} = useContext(BeansContext);

    const { cellCtrl, printLayout, editingRow } = props;

    const [renderDetails, setRenderDetails ] = useState<RenderDetails>();
    const [editDetails, setEditDetails ] = useState<EditDetails>();

    const [cssClasses, setCssClasses] = useState<CssClasses>(new CssClasses());
    const [userStyles, setUserStyles] = useState<any>();

    const [tabIndex, setTabIndex] = useState<number>();
    const [ariaSelected, setAriaSelected] = useState<boolean | undefined>();
    const [ariaExpanded, setAriaExpanded] = useState<boolean | undefined>();
    const [ariaColIndex, setAriaColIndex] = useState<number>();
    const [ariaDescribedBy, setAriaDescribedBy] = useState<string | undefined>();
    const [role, setRole] = useState<string>();
    const [colId, setColId] = useState<string>();
    const [title, setTitle] = useState<string | undefined>();
    const [includeSelection, setIncludeSelection] = useState<boolean>(false);
    const [includeRowDrag, setIncludeRowDrag] = useState<boolean>(false);
    const [includeDndSource, setIncludeDndSource] = useState<boolean>(false);
    const [forceWrapper, setForceWrapper] = useState<boolean>(false);

    const [jsEditorComp, setJsEditorComp] = useState<ICellEditorComp>();

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

    useJsCellRenderer(renderDetails, showTools, toolsValueSpan, jsCellRendererRef, eGui);

    useEffect(() => {
        const doingJsEditor = editDetails && !editDetails.compDetails.componentFromFramework;
        if (!doingJsEditor) { return; }

        const compDetails = editDetails!.compDetails;
        const isPopup = editDetails!.popup===true;
    
        const cellEditor = createJsComp(compDetails) as ICellEditorComp;
        if (!cellEditor) { return; }

        const compGui = cellEditor.getGui();

        setCellEditorRef(isPopup, cellEditor);

        if (!isPopup) {
            eGui.current!.appendChild(compGui);
            cellEditor.afterGuiAttached && cellEditor.afterGuiAttached();
        }

        setJsEditorComp(cellEditor);

        return () => {
            context.destroyBean(cellEditor);
            setCellEditorRef(isPopup, undefined);
            setJsEditorComp(undefined);
            if (compGui && compGui.parentElement) {
                compGui.parentElement.removeChild(compGui);
            }
        };
    }, [editDetails]);

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
            setAriaExpanded: value => setAriaExpanded(value),
            getFocusableElement: () => eGui.current!,
            setAriaColIndex: index => setAriaColIndex(index),
            setTabIndex: tabIndex => setTabIndex(tabIndex),
            setRole: role => setRole(role),
            setColId: colId => setColId(colId),
            setTitle: title => setTitle(title),
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

        cellCtrl.setComp(compProxy, null, eGui.current!, printLayout, editingRow);

    }, []);

    const reactCellRendererStateless = useMemo( ()=> {
        const res = renderDetails && renderDetails.compDetails 
                    && renderDetails.compDetails.componentFromFramework 
                    && isComponentStateless(renderDetails.compDetails.componentClass);
        return !!res;
    }, [renderDetails]);

    const className = useMemo( ()=> {
        let res = cssClasses.toString();
        if (!showTools) {
            res += ' ag-cell-value';
        }
        return res;
    }, [cssClasses, showTools]);

    const cellInstanceId = useMemo( ()=> cellCtrl.getInstanceId(), []);

    return (
        <div ref={ eGui } className={ className } style={ userStyles } tabIndex={ tabIndex }
             aria-selected={ ariaSelected } aria-colindex={ ariaColIndex } role={ role }
             aria-expanded={ ariaExpanded } col-id={ colId } title={ title } 
             aria-describedby={ ariaDescribedBy }>

            { renderDetails != null && jsxShowValue(renderDetails, cellInstanceId, cellRendererRef, 
                                                showTools, reactCellRendererStateless,
                                                toolsRefCallback, toolsValueRefCallback) }
            { editDetails != null && jsxEditValue(editDetails, setInlineCellEditorRef, setPopupCellEditorRef, eGui.current!, cellCtrl, jsEditorComp) }

        </div>
    );
}

export default memo(CellComp);
