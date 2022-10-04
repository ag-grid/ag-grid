import { CssClassManager, _ } from 'ag-grid-community';
import { createEffect, createMemo, createSignal, For, onMount } from 'solid-js';
import ShowEditDetails from './showEditDetails';
import ShowRenderDetails from './showRenderDetails';
const checkCellEditorDeprecations = (popup, cellEditor, cellCtrl) => {
    const col = cellCtrl.getColumn();
    // cellEditor is written to be a popup editor, however colDef.cellEditorPopup is not set
    if (!popup && cellEditor.isPopup && cellEditor.isPopup()) {
        const msg = `AG Grid: Found an issue in column ${col.getColId()}. If using SolidJS, specify an editor is a popup using colDef.cellEditorPopup=true. AG Grid SolidJS cannot depend on the editor component specifying if it's in a popup (via the isPopup() method on the editor), as SolidJS needs to know this information BEFORE the component is created.`;
        _.doOnce(() => console.warn(msg), 'jsEditorComp-isPopup-' + cellCtrl.getColumn().getColId());
    }
    // cellEditor is a popup and is trying to position itself the deprecated way
    if (popup && cellEditor.getPopupPosition && cellEditor.getPopupPosition() != null) {
        const msg = `AG Grid: Found an issue in column ${col.getColId()}. If using SolidJS, specify an editor popup position using colDef.cellEditorPopupPosition=true. AG Grid SolidJS cannot depend on the editor component specifying it's position (via the getPopupPosition() method on the editor), as SolidJS needs to know this information BEFORE the component is created.`;
        _.doOnce(() => console.warn(msg), 'jsEditorComp-getPopupPosition-' + cellCtrl.getColumn().getColId());
    }
};
const CellComp = (props) => {
    const { cellCtrl, printLayout, editingRow } = props;
    const [renderDetails, setRenderDetails] = createSignal();
    const [editDetails, setEditDetails] = createSignal();
    let renderCompVersion = 0;
    const [renderCompVersionList, setRenderCompVersionList] = createSignal([renderCompVersion]);
    const [userStyles, setUserStyles] = createSignal();
    const [tabIndex, setTabIndex] = createSignal();
    const [role, setRole] = createSignal();
    const [colId, setColId] = createSignal();
    const [title, setTitle] = createSignal();
    const [includeSelection, setIncludeSelection] = createSignal(false);
    const [includeRowDrag, setIncludeRowDrag] = createSignal(false);
    const [includeDndSource, setIncludeDndSource] = createSignal(false);
    const forceWrapper = cellCtrl.isForceWrapper();
    let eCellWrapper;
    let eCellValue;
    const setECellValue = (val) => {
        eCellValue = val;
    };
    let eGui;
    let cellRenderer = null;
    let cellEditor = null;
    const setEditorRef = (popup, ref) => {
        cellEditor = ref;
        if (!cellEditor) {
            return;
        }
        checkCellEditorDeprecations(popup, cellEditor, cellCtrl);
        const editingCancelledByUserComp = cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart();
        if (editingCancelledByUserComp) {
            // we cannot set state inside render, so hack is to do it in next VM turn
            setTimeout(() => cellCtrl.stopEditing(), 0);
        }
        const refAny = ref;
        if (refAny.afterGuiAttached) {
            setTimeout(() => refAny.afterGuiAttached(), 0);
        }
    };
    const setPopupEditorRef = (ref) => setEditorRef(true, ref);
    const setInlineEditorRef = (ref) => setEditorRef(false, ref);
    const cssClassManager = new CssClassManager(() => eGui);
    const showTools = createMemo(() => renderDetails() != null && (includeSelection() || includeDndSource() || includeRowDrag()));
    const showCellWrapper = createMemo(() => forceWrapper || showTools());
    const cellInstanceId = cellCtrl.getInstanceId();
    const ariaDescribedBy = createMemo(() => showCellWrapper() ? `cell-${cellInstanceId}` : undefined);
    onMount(() => {
        if (!cellCtrl) {
            return;
        }
        const compProxy = {
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
                        compDetails: compDetails,
                        popup,
                        popupPosition
                    });
                    if (!popup) {
                        setRenderDetails(undefined);
                    }
                }
                else {
                    // stop editing
                    setEditDetails(undefined);
                }
            }
        };
        cellCtrl.setComp(compProxy, eGui, eCellWrapper, printLayout, editingRow);
    });
    createEffect(() => {
        cssClassManager.addOrRemoveCssClass('ag-cell-value', !showCellWrapper());
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
        if (!cellRenderer) {
            return;
        }
        const params = details.compDetails.params;
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
    const bodyJsxFunc = () => (<>
                <For each={renderCompVersionList()}>{() => <>
                        {renderDetails() && <ShowRenderDetails showDetails={renderDetails()} ref={cellRenderer} cellInstanceId={cellInstanceId} showCellWrapper={showCellWrapper()} cellCtrl={cellCtrl} includeDndSource={includeDndSource()} includeRowDrag={includeRowDrag()} includeSelection={includeSelection()} showTools={showTools()} setECellValue={setECellValue}/>}
                    </>}</For>
                {editDetails() && <ShowEditDetails editDetails={editDetails()} cellCtrl={cellCtrl} eGuiFn={eGuiFn} setInlineRef={setInlineEditorRef} setPopupRef={setPopupEditorRef}/>}
        </>);
    return (<div ref={eGui} style={userStyles()} tabIndex={tabIndex()} role={role()} //fixme - why not hard code role to gridcell?
     col-id={colId()} title={title()} aria-describedby={ariaDescribedBy()}>            {showCellWrapper()
            ? (<div class="ag-cell-wrapper" role="presentation" ref={eCellWrapper}>
                        {bodyJsxFunc()}
                    </div>)
            : bodyJsxFunc()}
        </div>);
};
export default CellComp;
