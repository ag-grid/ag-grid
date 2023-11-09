import { CellCtrl, Component, ICellComp, ICellEditor, ICellRendererComp, UserCompDetails, _, ICellEditorComp, CssClassManager, CellStyle } from 'ag-grid-community';
import React, { MutableRefObject, useCallback, useRef, useState, useMemo, memo, useContext, useLayoutEffect } from 'react';
import { isComponentStateless } from '../utils';
import PopupEditorComp from './popupEditorComp';
import useJsCellRenderer from './showJsRenderer';
import { BeansContext } from '../beansContext';
import { createSyncJsComp } from '../jsComp';

export enum CellCompState { ShowValue, EditValue }

const checkCellEditorDeprecations = (popup: boolean, cellEditor: ICellEditor, cellCtrl: CellCtrl) => {

    const col = cellCtrl.getColumn();

    // cellEditor is written to be a popup editor, however colDef.cellEditorPopup is not set
    if (!popup && cellEditor.isPopup && cellEditor.isPopup()) {
        const msg = `AG Grid: Found an issue in column ${col.getColId()}. If using React, specify an editor is a popup using colDef.cellEditorPopup=true. AG Grid React cannot depend on the editor component specifying if it's in a popup (via the isPopup() method on the editor), as React needs to know this information BEFORE the component is created.`;
        _.doOnce(() => console.warn(msg), 'jsEditorComp-isPopup-' + cellCtrl.getColumn().getColId());
    }

    // cellEditor is a popup and is trying to position itself the deprecated way
    if (popup && cellEditor.getPopupPosition && cellEditor.getPopupPosition()!=null) {
        const msg = `AG Grid: Found an issue in column ${col.getColId()}. If using React, specify an editor popup position using colDef.cellEditorPopupPosition=true. AG Grid React cannot depend on the editor component specifying it's position (via the getPopupPosition() method on the editor), as React needs to know this information BEFORE the component is created.`;
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
                reactInlineEditor && <CellEditorClass { ...editDetails.compDetails.params } ref={ setInlineCellEditorRef }/> 
            }

            { 
                reactPopupEditor &&
                <PopupEditorComp
                    editDetails={ editDetails }
                    cellCtrl={cellCtrl}
                    eParentCell={eGui}
                    wrappedContent={
                        <CellEditorClass { ...editDetails.compDetails.params } ref={ setPopupCellEditorRef }/>
                    }
                />
            }

            { 
                jsPopupEditor &&
                jsEditorComp &&
                <PopupEditorComp
                    editDetails={editDetails}
                    cellCtrl={cellCtrl}
                    eParentCell={eGui}
                    jsChildComp={ jsEditorComp } 
                /> 
            }
        </>
    )
}

const jsxShowValue = (
    showDetails: RenderDetails,
    key: number,
    parentId: string,
    cellRendererRef: MutableRefObject<any>,
    showCellWrapper: boolean,
    reactCellRendererStateless: boolean,
    setECellValue: (ref:any) => void
) => {
    const { compDetails, value } = showDetails;

    const noCellRenderer = !compDetails;
    const reactCellRenderer = compDetails && compDetails.componentFromFramework;

    const CellRendererClass = compDetails && compDetails.componentClass;

    // if we didn't do this, objects would cause React error. we depend on objects for things
    // like the aggregation functions avg and count, which return objects and depend on toString()
    // getting called.
    const valueForNoCellRenderer = (value?.toString) ? value.toString() : value;

    const bodyJsxFunc = () => (
        <>
            { noCellRenderer && <>{ valueForNoCellRenderer }</> }
            { reactCellRenderer && !reactCellRendererStateless && <CellRendererClass { ...compDetails!.params } key={key} ref={ cellRendererRef }/> }
            { reactCellRenderer && reactCellRendererStateless && <CellRendererClass { ...compDetails!.params } key={key}/> }
        </>
    );

    return (
        <>
            {
                showCellWrapper
                ? (
                    <span role="presentation" id={`cell-${parentId}`} className="ag-cell-value" ref={ setECellValue }>
                        { bodyJsxFunc() }
                    </span>
                )
                : bodyJsxFunc()
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
    popupPosition?: 'over' | 'under';
}

const CellComp = (props: {
    cellCtrl: CellCtrl,
    printLayout: boolean, 
    editingRow: boolean
}) => {

    const { context } = useContext(BeansContext);
    const { cellCtrl, printLayout, editingRow } = props;

    const tabIndex = cellCtrl.getTabIndex();
    const colId = cellCtrl.getColumnIdSanitised();
    const cellInstanceId = cellCtrl.getInstanceId();

    // Only provide an initial state when not using a Cell Renderer so that we do not display a raw value before the cell renderer is created.
    const [renderDetails, setRenderDetails] = useState<RenderDetails | undefined>(() => cellCtrl.getIsCellRenderer() ? undefined : { compDetails: undefined, value: cellCtrl.getValueToDisplay(), force: false });
    const [editDetails, setEditDetails ] = useState<EditDetails>();
    const [renderKey, setRenderKey] = useState<number>(1);

    const [userStyles, setUserStyles] = useState<CellStyle>();

    const [includeSelection, setIncludeSelection] = useState<boolean>(false);
    const [includeRowDrag, setIncludeRowDrag] = useState<boolean>(false);
    const [includeDndSource, setIncludeDndSource] = useState<boolean>(false);

    const [jsEditorComp, setJsEditorComp] = useState<ICellEditorComp>();

    // useMemo as more then just accessing a boolean on the cellCtrl
    const forceWrapper = useMemo(() => cellCtrl.isForceWrapper(), [cellCtrl]);
    const eGui = useRef<HTMLDivElement | null>(null);
    const cellRendererRef = useRef<any>(null);
    const jsCellRendererRef = useRef<ICellRendererComp>();
    const cellEditorRef = useRef<ICellEditor>();

    const eCellWrapper = useRef<HTMLDivElement>();
    const cellWrapperDestroyFuncs = useRef<(() => void)[]>([]);

    // when setting the ref, we also update the state item to force a re-render
    const eCellValue = useRef<HTMLDivElement>();
    const [cellValueVersion, setCellValueVersion] = useState(0);
    const setCellValueRef = useCallback( (ref: HTMLDivElement) => {
        eCellValue.current = ref;
        setCellValueVersion( v => v+1 );
    }, []);
    
    const showTools = renderDetails != null && (includeSelection || includeDndSource || includeRowDrag);
    const showCellWrapper = forceWrapper || showTools;

    const setCellEditorRef = useCallback((popup: boolean, cellEditor: ICellEditor | undefined) => {
        cellEditorRef.current = cellEditor;
        if (cellEditor) {
            checkCellEditorDeprecations(popup, cellEditor, cellCtrl);
            const editingCancelledByUserComp = cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart();
            if (editingCancelledByUserComp) {
                // we cannot set state inside render, so hack is to do it in next VM turn
                setTimeout(() => {
                    cellCtrl.stopEditing(true);
                    cellCtrl.focusCell(true);
                });
            }
        }
    }, [cellCtrl]);

    const setPopupCellEditorRef = useCallback(
        (cellRenderer: ICellEditor | undefined) => setCellEditorRef(true, cellRenderer),
        [setCellEditorRef]
    );

    const setInlineCellEditorRef = useCallback(
        (cellRenderer: ICellEditor | undefined) => setCellEditorRef(false, cellRenderer), 
        [setCellEditorRef]
    );
    let cssClassManager = useRef<CssClassManager>();
    if(!cssClassManager.current){
        cssClassManager.current = new CssClassManager(() => eGui.current);
    }    

    useJsCellRenderer(renderDetails, showCellWrapper, eCellValue.current, cellValueVersion, jsCellRendererRef, eGui);

    // if RenderDetails changed, need to call refresh. This is not our preferred way (the preferred
    // way for React is just allow the new props to propagate down to the React Cell Renderer)
    // however we do this for backwards compatibility, as having refresh used to be supported.
    const lastRenderDetails = useRef<RenderDetails>();
    useLayoutEffect(() => {
        const oldDetails = lastRenderDetails.current;
        const newDetails = renderDetails;
        lastRenderDetails.current = renderDetails;

        // if not updating renderDetails, do nothing
        if (
            oldDetails == null ||
            oldDetails.compDetails == null ||
            newDetails == null ||
            newDetails.compDetails==null
        ) { return; }

        const oldCompDetails = oldDetails.compDetails;
        const newCompDetails = newDetails.compDetails;

        // if different Cell Renderer, then do nothing, as renderer will be recreated
        if (oldCompDetails.componentClass != newCompDetails.componentClass) { return; }

        // if no refresh method, do nothing
        if (cellRendererRef.current == null || cellRendererRef.current.refresh == null) {  return; }

        const result = cellRendererRef.current.refresh(newCompDetails.params);
        if (result != true) {
            // increasing the render key forces the refresh. this is undocumented (for React users,
            // we don't document the refresh method, instead we tell them to act on new params).
            // however the GroupCellRenderer has this logic in it and would need a small refactor
            // to get it working without using refresh() returning false. so this hack staying in,
            // in React if refresh() is implemented and returns false (or undefined), we force a refresh
            setRenderKey( prev => prev + 1 );
        }

    }, [renderDetails]);

    useLayoutEffect(() => {
        const doingJsEditor = editDetails && !editDetails.compDetails.componentFromFramework;
        if (!doingJsEditor) { return; }

        const compDetails = editDetails!.compDetails;
        const isPopup = editDetails!.popup === true;
    
        const cellEditor = createSyncJsComp(compDetails) as ICellEditorComp;
        if (!cellEditor) { return; }

        const compGui = cellEditor.getGui();

        setCellEditorRef(isPopup, cellEditor);

        if (!isPopup) {
            const parentEl = (forceWrapper ? eCellWrapper : eGui).current;
            parentEl?.appendChild(compGui);

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
    const setCellWrapperRef = useCallback((ref: HTMLDivElement) => {
        eCellWrapper.current = ref;

        if (!eCellWrapper.current) {
            cellWrapperDestroyFuncs.current.forEach(f => f());
            cellWrapperDestroyFuncs.current = [];
            return;
        }

        const addComp = (comp: Component | undefined) => {
            if (comp) {
                const eGui = comp.getGui();
                eCellWrapper.current?.insertAdjacentElement('afterbegin', eGui);
                cellWrapperDestroyFuncs.current.push(() => {
                    context.destroyBean(comp);
                    _.removeFromParent(eGui);
                });
            }
            return comp;
        }

        if (includeSelection) {
            const checkboxSelectionComp = cellCtrl.createSelectionCheckbox();
            addComp(checkboxSelectionComp);
        }

        if (includeDndSource) {
            addComp(cellCtrl.createDndSource());
        }

        if (includeRowDrag) {
            addComp(cellCtrl.createRowDragComp());
        }
    }, [cellCtrl, context, includeDndSource, includeRowDrag, includeSelection]);

    // we use layout effect here as we want to synchronously process setComp and it's side effects
    // to ensure the component is fully initialised prior to the first browser paint. See AG-7018.

    const setRef = useCallback((ref: HTMLDivElement | null) => {
        eGui.current = ref;
        if (!eGui.current) {
            return;
        }

        if (!cellCtrl) { return; }

        const compProxy: ICellComp = {
            addOrRemoveCssClass: (name, on) => cssClassManager.current!.addOrRemoveCssClass(name, on),
            setUserStyles: (styles: CellStyle) => setUserStyles(styles),
            getFocusableElement: () => eGui.current!,

            setIncludeSelection: include => setIncludeSelection(include),
            setIncludeRowDrag: include => setIncludeRowDrag(include),
            setIncludeDndSource: include => setIncludeDndSource(include),
            
            getCellEditor: () => cellEditorRef.current || null,
            getCellRenderer: () => cellRendererRef.current ? cellRendererRef.current : jsCellRendererRef.current,
            getParentOfValue: () => eCellValue.current ? eCellValue.current : eCellWrapper.current ? eCellWrapper.current : eGui.current,

            setRenderDetails: (compDetails, value, force) => {
                setRenderDetails(prev => {


                    if (prev?.compDetails !== compDetails || prev?.value !== value || prev?.force !== force) {
                        return {
                            value,
                            compDetails,
                            force
                        }
                    } else {
                        return prev;
                    }
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

        const cellWrapperOrUndefined = eCellWrapper.current || undefined;
        cellCtrl.setComp(compProxy, eGui.current, cellWrapperOrUndefined, printLayout, editingRow);

    }, []);

    const reactCellRendererStateless = useMemo(() => {
        const res =
            renderDetails &&
            renderDetails.compDetails &&
            renderDetails.compDetails.componentFromFramework &&
            isComponentStateless(renderDetails.compDetails.componentClass);

        return !!res;
    }, [renderDetails]);

    useLayoutEffect(() => {
        if (!eGui.current) { return; }
        cssClassManager.current!.addOrRemoveCssClass('ag-cell-value', !showCellWrapper);
        cssClassManager.current!.addOrRemoveCssClass('ag-cell-inline-editing', !!editDetails && !editDetails.popup);
        cssClassManager.current!.addOrRemoveCssClass('ag-cell-popup-editing', !!editDetails && !!editDetails.popup);
        cssClassManager.current!.addOrRemoveCssClass('ag-cell-not-inline-editing', !editDetails || !!editDetails.popup);
        cellCtrl.getRowCtrl()?.setInlineEditingCss(!!editDetails);

        if (cellCtrl.shouldRestoreFocus() && !cellCtrl.isEditing()) {
            // Restore focus to the cell if it was focused before and not editing.
            // If it is editing then it is likely the focus was moved to the editor and we should not move it back.
            eGui.current.focus({ preventScroll: true });
        }
    });


    const showContents = () => (
        <>
            {
                (renderDetails != null && jsxShowValue(
                    renderDetails,
                    renderKey,
                    cellInstanceId,
                    cellRendererRef,
                    showCellWrapper,
                    reactCellRendererStateless,
                    setCellValueRef
                ))
            }
            {
                (editDetails != null && jsxEditValue(
                    editDetails,
                    setInlineCellEditorRef,
                    setPopupCellEditorRef,
                    eGui.current!,
                    cellCtrl,
                    jsEditorComp
                ))
            }
        </>
    );

    return (
        <div
            ref={setRef}
            style={ userStyles }
            tabIndex={ tabIndex }
            role={'gridcell'}
            col-id={colId}
        >
            { showCellWrapper
                ? (
                    <div className="ag-cell-wrapper" role="presentation" ref={ setCellWrapperRef }>
                        { showContents() }
                    </div>
                )
                : showContents()
            }
        </div>
    );
}

export default memo(CellComp);
