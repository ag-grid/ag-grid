// @ag-grid-community/react v31.0.0
import { _, CssClassManager } from '@ag-grid-community/core';
import React, { useCallback, useRef, useState, useMemo, memo, useContext, useLayoutEffect } from 'react';
import { isComponentStateless } from '../utils.mjs';
import PopupEditorComp from './popupEditorComp.mjs';
import useJsCellRenderer from './showJsRenderer.mjs';
import { BeansContext } from '../beansContext.mjs';
import { createSyncJsComp } from '../jsComp.mjs';
export var CellCompState;
(function (CellCompState) {
    CellCompState[CellCompState["ShowValue"] = 0] = "ShowValue";
    CellCompState[CellCompState["EditValue"] = 1] = "EditValue";
})(CellCompState || (CellCompState = {}));
const checkCellEditorDeprecations = (popup, cellEditor, cellCtrl) => {
    const col = cellCtrl.getColumn();
    // cellEditor is written to be a popup editor, however colDef.cellEditorPopup is not set
    if (!popup && cellEditor.isPopup && cellEditor.isPopup()) {
        const msg = `AG Grid: Found an issue in column ${col.getColId()}. If using React, specify an editor is a popup using colDef.cellEditorPopup=true. AG Grid React cannot depend on the editor component specifying if it's in a popup (via the isPopup() method on the editor), as React needs to know this information BEFORE the component is created.`;
        _.doOnce(() => console.warn(msg), 'jsEditorComp-isPopup-' + cellCtrl.getColumn().getColId());
    }
    // cellEditor is a popup and is trying to position itself the deprecated way
    if (popup && cellEditor.getPopupPosition && cellEditor.getPopupPosition() != null) {
        const msg = `AG Grid: Found an issue in column ${col.getColId()}. If using React, specify an editor popup position using colDef.cellEditorPopupPosition=true. AG Grid React cannot depend on the editor component specifying it's position (via the getPopupPosition() method on the editor), as React needs to know this information BEFORE the component is created.`;
        _.doOnce(() => console.warn(msg), 'jsEditorComp-getPopupPosition-' + cellCtrl.getColumn().getColId());
    }
};
const jsxEditValue = (editDetails, setInlineCellEditorRef, setPopupCellEditorRef, eGui, cellCtrl, jsEditorComp) => {
    const compDetails = editDetails.compDetails;
    const CellEditorClass = compDetails.componentClass;
    const reactInlineEditor = compDetails.componentFromFramework && !editDetails.popup;
    const reactPopupEditor = compDetails.componentFromFramework && editDetails.popup;
    const jsPopupEditor = !compDetails.componentFromFramework && editDetails.popup;
    return (React.createElement(React.Fragment, null,
        reactInlineEditor && React.createElement(CellEditorClass, Object.assign({}, editDetails.compDetails.params, { ref: setInlineCellEditorRef })),
        reactPopupEditor &&
            React.createElement(PopupEditorComp, { editDetails: editDetails, cellCtrl: cellCtrl, eParentCell: eGui, wrappedContent: React.createElement(CellEditorClass, Object.assign({}, editDetails.compDetails.params, { ref: setPopupCellEditorRef })) }),
        jsPopupEditor &&
            jsEditorComp &&
            React.createElement(PopupEditorComp, { editDetails: editDetails, cellCtrl: cellCtrl, eParentCell: eGui, jsChildComp: jsEditorComp })));
};
const jsxShowValue = (showDetails, key, parentId, cellRendererRef, showCellWrapper, reactCellRendererStateless, setECellValue) => {
    const { compDetails, value } = showDetails;
    const noCellRenderer = !compDetails;
    const reactCellRenderer = compDetails && compDetails.componentFromFramework;
    const CellRendererClass = compDetails && compDetails.componentClass;
    // if we didn't do this, objects would cause React error. we depend on objects for things
    // like the aggregation functions avg and count, which return objects and depend on toString()
    // getting called.
    const valueForNoCellRenderer = (value === null || value === void 0 ? void 0 : value.toString) ? value.toString() : value;
    const bodyJsxFunc = () => (React.createElement(React.Fragment, null,
        noCellRenderer && React.createElement(React.Fragment, null, valueForNoCellRenderer),
        reactCellRenderer && !reactCellRendererStateless && React.createElement(CellRendererClass, Object.assign({}, compDetails.params, { key: key, ref: cellRendererRef })),
        reactCellRenderer && reactCellRendererStateless && React.createElement(CellRendererClass, Object.assign({}, compDetails.params, { key: key }))));
    return (React.createElement(React.Fragment, null, showCellWrapper
        ? (React.createElement("span", { role: "presentation", id: `cell-${parentId}`, className: "ag-cell-value", ref: setECellValue }, bodyJsxFunc()))
        : bodyJsxFunc()));
};
const CellComp = (props) => {
    const { context } = useContext(BeansContext);
    const { cellCtrl, printLayout, editingRow } = props;
    const tabIndex = cellCtrl.getTabIndex();
    const colId = cellCtrl.getColumnIdSanitised();
    const cellInstanceId = cellCtrl.getInstanceId();
    // Only provide an initial state when not using a Cell Renderer so that we do not display a raw value before the cell renderer is created.
    const [renderDetails, setRenderDetails] = useState(() => cellCtrl.getIsCellRenderer() ? undefined : { compDetails: undefined, value: cellCtrl.getValueToDisplay(), force: false });
    const [editDetails, setEditDetails] = useState();
    const [renderKey, setRenderKey] = useState(1);
    const [userStyles, setUserStyles] = useState();
    const [includeSelection, setIncludeSelection] = useState(false);
    const [includeRowDrag, setIncludeRowDrag] = useState(false);
    const [includeDndSource, setIncludeDndSource] = useState(false);
    const [jsEditorComp, setJsEditorComp] = useState();
    // useMemo as more then just accessing a boolean on the cellCtrl
    const forceWrapper = useMemo(() => cellCtrl.isForceWrapper(), [cellCtrl]);
    const cellAriaRole = useMemo(() => cellCtrl.getCellAriaRole(), [cellCtrl]);
    const eGui = useRef(null);
    const cellRendererRef = useRef(null);
    const jsCellRendererRef = useRef();
    const cellEditorRef = useRef();
    const eCellWrapper = useRef();
    const cellWrapperDestroyFuncs = useRef([]);
    // when setting the ref, we also update the state item to force a re-render
    const eCellValue = useRef();
    const [cellValueVersion, setCellValueVersion] = useState(0);
    const setCellValueRef = useCallback((ref) => {
        eCellValue.current = ref;
        setCellValueVersion(v => v + 1);
    }, []);
    const showTools = renderDetails != null && (includeSelection || includeDndSource || includeRowDrag);
    const showCellWrapper = forceWrapper || showTools;
    const setCellEditorRef = useCallback((popup, cellEditor) => {
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
    const setPopupCellEditorRef = useCallback((cellRenderer) => setCellEditorRef(true, cellRenderer), [setCellEditorRef]);
    const setInlineCellEditorRef = useCallback((cellRenderer) => setCellEditorRef(false, cellRenderer), [setCellEditorRef]);
    let cssClassManager = useRef();
    if (!cssClassManager.current) {
        cssClassManager.current = new CssClassManager(() => eGui.current);
    }
    useJsCellRenderer(renderDetails, showCellWrapper, eCellValue.current, cellValueVersion, jsCellRendererRef, eGui);
    // if RenderDetails changed, need to call refresh. This is not our preferred way (the preferred
    // way for React is just allow the new props to propagate down to the React Cell Renderer)
    // however we do this for backwards compatibility, as having refresh used to be supported.
    const lastRenderDetails = useRef();
    useLayoutEffect(() => {
        const oldDetails = lastRenderDetails.current;
        const newDetails = renderDetails;
        lastRenderDetails.current = renderDetails;
        // if not updating renderDetails, do nothing
        if (oldDetails == null ||
            oldDetails.compDetails == null ||
            newDetails == null ||
            newDetails.compDetails == null) {
            return;
        }
        const oldCompDetails = oldDetails.compDetails;
        const newCompDetails = newDetails.compDetails;
        // if different Cell Renderer, then do nothing, as renderer will be recreated
        if (oldCompDetails.componentClass != newCompDetails.componentClass) {
            return;
        }
        // if no refresh method, do nothing
        if (cellRendererRef.current == null || cellRendererRef.current.refresh == null) {
            return;
        }
        const result = cellRendererRef.current.refresh(newCompDetails.params);
        if (result != true) {
            // increasing the render key forces the refresh. this is undocumented (for React users,
            // we don't document the refresh method, instead we tell them to act on new params).
            // however the GroupCellRenderer has this logic in it and would need a small refactor
            // to get it working without using refresh() returning false. so this hack staying in,
            // in React if refresh() is implemented and returns false (or undefined), we force a refresh
            setRenderKey(prev => prev + 1);
        }
    }, [renderDetails]);
    useLayoutEffect(() => {
        const doingJsEditor = editDetails && !editDetails.compDetails.componentFromFramework;
        if (!doingJsEditor) {
            return;
        }
        const compDetails = editDetails.compDetails;
        const isPopup = editDetails.popup === true;
        const cellEditor = createSyncJsComp(compDetails);
        if (!cellEditor) {
            return;
        }
        const compGui = cellEditor.getGui();
        setCellEditorRef(isPopup, cellEditor);
        if (!isPopup) {
            const parentEl = (forceWrapper ? eCellWrapper : eGui).current;
            parentEl === null || parentEl === void 0 ? void 0 : parentEl.appendChild(compGui);
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
    const setCellWrapperRef = useCallback((ref) => {
        eCellWrapper.current = ref;
        if (!eCellWrapper.current) {
            cellWrapperDestroyFuncs.current.forEach(f => f());
            cellWrapperDestroyFuncs.current = [];
            return;
        }
        const addComp = (comp) => {
            var _a;
            if (comp) {
                const eGui = comp.getGui();
                (_a = eCellWrapper.current) === null || _a === void 0 ? void 0 : _a.insertAdjacentElement('afterbegin', eGui);
                cellWrapperDestroyFuncs.current.push(() => {
                    context.destroyBean(comp);
                    _.removeFromParent(eGui);
                });
            }
            return comp;
        };
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
    const setRef = useCallback((ref) => {
        eGui.current = ref;
        if (!eGui.current) {
            return;
        }
        if (!cellCtrl) {
            return;
        }
        const compProxy = {
            addOrRemoveCssClass: (name, on) => cssClassManager.current.addOrRemoveCssClass(name, on),
            setUserStyles: (styles) => setUserStyles(styles),
            getFocusableElement: () => eGui.current,
            setIncludeSelection: include => setIncludeSelection(include),
            setIncludeRowDrag: include => setIncludeRowDrag(include),
            setIncludeDndSource: include => setIncludeDndSource(include),
            getCellEditor: () => cellEditorRef.current || null,
            getCellRenderer: () => cellRendererRef.current ? cellRendererRef.current : jsCellRendererRef.current,
            getParentOfValue: () => eCellValue.current ? eCellValue.current : eCellWrapper.current ? eCellWrapper.current : eGui.current,
            setRenderDetails: (compDetails, value, force) => {
                setRenderDetails(prev => {
                    if ((prev === null || prev === void 0 ? void 0 : prev.compDetails) !== compDetails || (prev === null || prev === void 0 ? void 0 : prev.value) !== value || (prev === null || prev === void 0 ? void 0 : prev.force) !== force) {
                        return {
                            value,
                            compDetails,
                            force
                        };
                    }
                    else {
                        return prev;
                    }
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
        const cellWrapperOrUndefined = eCellWrapper.current || undefined;
        cellCtrl.setComp(compProxy, eGui.current, cellWrapperOrUndefined, printLayout, editingRow);
    }, []);
    const reactCellRendererStateless = useMemo(() => {
        const res = renderDetails &&
            renderDetails.compDetails &&
            renderDetails.compDetails.componentFromFramework &&
            isComponentStateless(renderDetails.compDetails.componentClass);
        return !!res;
    }, [renderDetails]);
    useLayoutEffect(() => {
        var _a;
        if (!eGui.current) {
            return;
        }
        cssClassManager.current.addOrRemoveCssClass('ag-cell-value', !showCellWrapper);
        cssClassManager.current.addOrRemoveCssClass('ag-cell-inline-editing', !!editDetails && !editDetails.popup);
        cssClassManager.current.addOrRemoveCssClass('ag-cell-popup-editing', !!editDetails && !!editDetails.popup);
        cssClassManager.current.addOrRemoveCssClass('ag-cell-not-inline-editing', !editDetails || !!editDetails.popup);
        (_a = cellCtrl.getRowCtrl()) === null || _a === void 0 ? void 0 : _a.setInlineEditingCss(!!editDetails);
        if (cellCtrl.shouldRestoreFocus() && !cellCtrl.isEditing()) {
            // Restore focus to the cell if it was focused before and not editing.
            // If it is editing then it is likely the focus was moved to the editor and we should not move it back.
            eGui.current.focus({ preventScroll: true });
        }
    });
    const showContents = () => (React.createElement(React.Fragment, null,
        (renderDetails != null && jsxShowValue(renderDetails, renderKey, cellInstanceId, cellRendererRef, showCellWrapper, reactCellRendererStateless, setCellValueRef)),
        (editDetails != null && jsxEditValue(editDetails, setInlineCellEditorRef, setPopupCellEditorRef, eGui.current, cellCtrl, jsEditorComp))));
    return (React.createElement("div", { ref: setRef, style: userStyles, tabIndex: tabIndex, role: cellAriaRole, "col-id": colId }, showCellWrapper
        ? (React.createElement("div", { className: "ag-cell-wrapper", role: "presentation", ref: setCellWrapperRef }, showContents()))
        : showContents()));
};
export default memo(CellComp);
