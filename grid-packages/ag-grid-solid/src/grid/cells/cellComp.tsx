import { CellCtrl, CssClassManager, ICellComp, ICellEditor, ICellRenderer, _ } from 'ag-grid-community';
import { createEffect, createMemo, createSignal, For, onMount } from 'solid-js';
import { EditDetails, RenderDetails } from './common';
import ShowEditDetails from './showEditDetails';
import ShowRenderDetails from './showRenderDetails';

const checkCellEditorDeprecations = (popup: boolean, cellEditor: ICellEditor, cellCtrl: CellCtrl) => {

    const col = cellCtrl.getColumn();

    // cellEditor is written to be a popup editor, however colDef.cellEditorPopup is not set
    if (!popup && cellEditor.isPopup && cellEditor.isPopup()) {
        const msg = `AG Grid: Found an issue in column ${col.getColId()}. If using SolidJS, specify an editor is a popup using colDef.cellEditorPopup=true. AG Grid SolidJS cannot depend on the editor component specifying if it's in a popup (via the isPopup() method on the editor), as SolidJS needs to know this information BEFORE the component is created.`;
        _.doOnce(() => console.warn(msg), 'jsEditorComp-isPopup-' + cellCtrl.getColumn().getColId());
    }

    // cellEditor is a popup and is trying to position itself the deprecated way
    if (popup && cellEditor.getPopupPosition && cellEditor.getPopupPosition()!=null) {
        const msg = `AG Grid: Found an issue in column ${col.getColId()}. If using SolidJS, specify an editor popup position using colDef.cellEditorPopupPosition=true. AG Grid SolidJS cannot depend on the editor component specifying it's position (via the getPopupPosition() method on the editor), as SolidJS needs to know this information BEFORE the component is created.`;
        _.doOnce(() => console.warn(msg), 'jsEditorComp-getPopupPosition-' + cellCtrl.getColumn().getColId());
    }
}

const CellComp = (props: {
    cellCtrl: CellCtrl,
    printLayout: boolean, 
    editingRow: boolean
}) => {

    const { cellCtrl, printLayout, editingRow } = props;

    const [renderDetails, setRenderDetails ] = createSignal<RenderDetails>();
    const [editDetails, setEditDetails ] = createSignal<EditDetails>();

    let renderCompVersion = 0;
    const [renderCompVersionList, setRenderCompVersionList] = createSignal<number[]>([renderCompVersion]);

    const [userStyles, setUserStyles] = createSignal<any>();

    const [tabIndex, setTabIndex] = createSignal<number>();
    const [role, setRole] = createSignal<string>();
    const [colId, setColId] = createSignal<string>();
    const [title, setTitle] = createSignal<string | undefined>();
    const [selectionCheckboxId, setSelectionCheckboxId] = createSignal<string>();
    const [includeSelection, setIncludeSelection] = createSignal<boolean>(false);
    const [includeRowDrag, setIncludeRowDrag] = createSignal<boolean>(false);
    const [includeDndSource, setIncludeDndSource] = createSignal<boolean>(false);

    const forceWrapper = cellCtrl.isForceWrapper();

    let eCellWrapper: HTMLDivElement;
    let eCellValue: HTMLElement;
    const setECellValue = (val: HTMLElement)=> {
        eCellValue = val;
    };

    let eGui: HTMLDivElement;
    let cellRenderer: ICellRenderer | null = null;

    let cellEditor: ICellEditor | null = null;
    const setEditorRef = (popup: boolean, ref: ICellEditor)=> {
        cellEditor = ref;
        if (!cellEditor) { return; }

        checkCellEditorDeprecations(popup, cellEditor, cellCtrl);

        const editingCancelledByUserComp = cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart();
        if (editingCancelledByUserComp) {
            // we cannot set state inside render, so hack is to do it in next VM turn
            setTimeout(() => {
                cellCtrl.stopEditing(true);
                cellCtrl.focusCell(true);
            });
        }

        const refAny = ref as any;
        if (refAny.afterGuiAttached) {
            setTimeout(() => refAny.afterGuiAttached(), 0);
        }
    }
    const setPopupEditorRef = (ref: ICellEditor) => setEditorRef(true, ref);
    const setInlineEditorRef = (ref: ICellEditor) => setEditorRef(false, ref);

    const cssClassManager = new CssClassManager(() => eGui);

    const showTools = createMemo(() => renderDetails() != null && (includeSelection() || includeDndSource() || includeRowDrag()) );
    const showCellWrapper = createMemo(() => forceWrapper || showTools());

    const cellInstanceId = cellCtrl.getInstanceId();

    const ariaDescribedBy = createMemo(() => {
        const cellId = `cell-${cellInstanceId}`;
        const describedByIds: string[] = [];

        if (includeSelection() && selectionCheckboxId()) {
            describedByIds.push(selectionCheckboxId()!);
        }
        
        describedByIds.push(cellId);

        return describedByIds.join(' ')
    });

    onMount( () => {
        if (!cellCtrl) { return; }

        const compProxy: ICellComp = {
            addOrRemoveCssClass: (name, on) => cssClassManager.addOrRemoveCssClass(name, on),
            setUserStyles: styles => setUserStyles(styles),
            getFocusableElement: () => eGui,
            setTabIndex: tabIndex => setTabIndex(tabIndex),
            setRole: role => setRole(role),
            setColId: colId => setColId(colId),
            setTitle: title => setTitle(title),
            setIncludeSelection: include => setIncludeSelection(include),
            setIncludeRowDrag: include => setIncludeRowDrag(include),
            setIncludeDndSource: include => setIncludeDndSource(include),
            
            getCellEditor: () => cellEditor,
            getCellRenderer: () => cellRenderer ? cellRenderer : null,
            getParentOfValue: () => eCellValue ? eCellValue : eCellWrapper ? eCellWrapper : eGui,

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

        cellCtrl.setComp(compProxy, eGui, eCellWrapper, printLayout, editingRow);
    });

    createEffect(() => {
        const isEditing = !!editDetails();
        const isPopup = isEditing && !!editDetails()?.popup;

        cssClassManager.addOrRemoveCssClass('ag-cell-value', !showCellWrapper());
        cssClassManager.addOrRemoveCssClass('ag-cell-inline-editing', isEditing && !isPopup);
        cssClassManager.addOrRemoveCssClass('ag-cell-popup-editing', isEditing && isPopup);
        cssClassManager.addOrRemoveCssClass('ag-cell-not-inline-editing', !isEditing || isPopup);
        cellCtrl.getRowCtrl()?.setInlineEditingCss(isEditing);
    });

    // we only do refreshing for JS Comps. for SolidJS, the props will change for the cell renderer.
    let readyForRefresh = false;
    createEffect(() => {
        const details = renderDetails();
        const isJsCellRenderer = details != null && details.compDetails != null && !details.compDetails.componentFromFramework;
        if (!isJsCellRenderer) {
            readyForRefresh = false;
            return;
        }
        if (!readyForRefresh) {
            readyForRefresh = true;
            return;
        }

        if (!cellRenderer) { return; }

        const params = details.compDetails!.params;
        const result = cellRenderer.refresh ? cellRenderer.refresh(params) : false;
        if (result != true) {
            // increasing the render key forces a new instance of ShowRenderDetails,
            // as we iteration through renderCompVersion, if the contents of
            // renderCompVersion changes, that maps to a new ShowRenderDetails instance.
            renderCompVersion++;
            setRenderCompVersionList([renderCompVersion]);
        }
    });

    // we pass in eGui as a function below as eGui is not ready
    // when the template is built, only after it. so we defer
    // reading eGui variable until it's needed, after ShowEditDetails
    // is created.
    const eGuiFn = () => eGui;

    const bodyJsxFunc = () => (
        <>
                <For each={
                    renderCompVersionList()}>{() =>
                    <>
                        { renderDetails() && <ShowRenderDetails 
                            showDetails={renderDetails()!}
                            ref={cellRenderer}
                            cellInstanceId={cellInstanceId}
                            showCellWrapper={showCellWrapper()}
                            cellCtrl={cellCtrl}
                            includeDndSource={includeDndSource()}
                            includeRowDrag={includeRowDrag()}
                            includeSelection={includeSelection()}
                            setSelectionCheckboxId={setSelectionCheckboxId}
                            showTools={showTools()}
                            setECellValue={setECellValue}
                        /> }
                    </>
                }</For>
                { editDetails() &&
                    <ShowEditDetails
                        editDetails={editDetails()!}
                        cellCtrl={cellCtrl}
                        eGuiFn={eGuiFn}
                        setInlineRef={setInlineEditorRef}
                        setPopupRef={setPopupEditorRef}
                    /> 
                }
        </>);

    return (
        <div
            ref={ eGui! }
            style={ userStyles() }
            tabIndex={ tabIndex() }
            role={ role() as 'gridcell'} //fixme - why not hard code role to gridcell?
            col-id={ colId() }
            title={ title() }
            aria-describedby={ ariaDescribedBy() }> {
                showCellWrapper()
                ? (
                    <div class="ag-cell-wrapper" role="presentation" aria-hidden="true" ref={ eCellWrapper! }>
                        { bodyJsxFunc() }
                    </div>
                )
                : bodyJsxFunc()
            }
        </div>
    );
}

export default CellComp;
