import React, { Suspense, memo, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type {
    CellCtrl,
    CellStyle,
    Component,
    ICellComp,
    ICellEditor,
    ICellEditorComp,
    ICellRendererComp,
    RowDragComp,
} from 'ag-grid-community';
import { CssClassManager, _EmptyBean, _removeFromParent } from 'ag-grid-community';

import { CellEditorComponentProxy } from '../../shared/customComp/cellEditorComponentProxy';
import { warnReactiveCustomComponents } from '../../shared/customComp/util';
import { BeansContext } from '../beansContext';
import { agStartTransition, isComponentStateless } from '../utils';
import { jsxEditValue } from './cellEditorComp';
import type { EditDetails, RenderDetails } from './interfaces';
import useJsCellRenderer from './showJsRenderer';
import { SkeletonCellRenderer } from './skeletonCellComp';

const CellComp = ({
    cellCtrl,
    printLayout,
    editingCell,
}: {
    cellCtrl: CellCtrl;
    printLayout: boolean;
    editingCell: boolean;
}) => {
    const beans = useContext(BeansContext);
    const { context } = beans;
    const {
        column: { colIdSanitised },
        instanceId,
    } = cellCtrl;
    const compBean = useRef<_EmptyBean>();

    // Only provide an initial state when not using a Cell Renderer so that we do not display a raw value before the cell renderer is created.
    const [renderDetails, setRenderDetails] = useState<RenderDetails | undefined>(() =>
        cellCtrl.isCellRenderer()
            ? undefined
            : { compDetails: undefined, value: cellCtrl.getValueToDisplay(), force: false }
    );
    const [editDetails, setEditDetails] = useState<EditDetails>();
    const [renderKey, setRenderKey] = useState<number>(1);

    const [userStyles, setUserStyles] = useState<CellStyle>();

    const [includeSelection, setIncludeSelection] = useState<boolean>(false);
    const [includeRowDrag, setIncludeRowDrag] = useState<boolean>(false);
    const [includeDndSource, setIncludeDndSource] = useState<boolean>(false);

    const [jsEditorComp, setJsEditorComp] = useState<ICellEditorComp>();

    // useMemo as more then just accessing a boolean on the cellCtrl
    const forceWrapper = useMemo(() => cellCtrl.isForceWrapper(), [cellCtrl]);
    const cellAriaRole = useMemo(() => cellCtrl.getCellAriaRole(), [cellCtrl]);
    const eGui = useRef<HTMLDivElement | null>(null);
    const eWrapper = useRef<HTMLDivElement | null>(null);
    const cellRendererRef = useRef<any>(null);
    const jsCellRendererRef = useRef<ICellRendererComp>();
    const cellEditorRef = useRef<ICellEditor>();

    const eCellWrapper = useRef<HTMLDivElement | null>();
    const cellWrapperDestroyFuncs = useRef<(() => void)[]>([]);
    const rowDragCompRef = useRef<RowDragComp | undefined>();

    // when setting the ref, we also update the state item to force a re-render
    const eCellValue = useRef<HTMLDivElement | null>();
    const [cellValueVersion, setCellValueVersion] = useState(0);
    const setCellValueRef = useCallback((ref: HTMLDivElement | null) => {
        eCellValue.current = ref;
        setCellValueVersion((v) => v + 1);
    }, []);

    const showTools =
        renderDetails != null &&
        (includeSelection || includeDndSource || includeRowDrag) &&
        (editDetails == null || !!editDetails.popup);
    const showCellWrapper = forceWrapper || showTools;
    const cellValueClass = useMemo(() => {
        return cellCtrl.getCellValueClass();
    }, [cellCtrl]);

    const setCellEditorRef = useCallback(
        (cellEditor: ICellEditor | undefined) => {
            cellEditorRef.current = cellEditor;
            if (cellEditor) {
                const editingCancelledByUserComp = cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart();
                setTimeout(() => {
                    // we cannot set state inside render, so hack is to do it in next VM turn
                    if (editingCancelledByUserComp) {
                        cellCtrl.stopEditing(true);
                        cellCtrl.focusCell(true);
                    } else {
                        cellCtrl.cellEditorAttached();
                        cellCtrl.enableEditorTooltipFeature(cellEditor);
                    }
                });
            }
        },
        [cellCtrl]
    );

    const cssManager = useRef<CssClassManager>();

    if (!cssManager.current) {
        cssManager.current = new CssClassManager(() => eGui.current);
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
            newDetails.compDetails == null
        ) {
            return;
        }

        rowDragCompRef.current?.refreshVisibility();

        const oldCompDetails = oldDetails.compDetails;
        const newCompDetails = newDetails.compDetails;

        // if different Cell Renderer, then do nothing, as renderer will be recreated
        if (oldCompDetails.componentClass != newCompDetails.componentClass) {
            return;
        }

        // if no refresh method, do nothing
        if (cellRendererRef.current?.refresh == null) {
            return;
        }

        const result = cellRendererRef.current.refresh(newCompDetails.params);
        if (result != true) {
            // increasing the render key forces the refresh. this is undocumented (for React users,
            // we don't document the refresh method, instead we tell them to act on new params).
            // however the GroupCellRenderer has this logic in it and would need a small refactor
            // to get it working without using refresh() returning false. so this hack staying in,
            // in React if refresh() is implemented and returns false (or undefined), we force a refresh
            setRenderKey((prev) => prev + 1);
        }
    }, [renderDetails]);

    useLayoutEffect(() => {
        const doingJsEditor = editDetails && !editDetails.compDetails.componentFromFramework;
        if (!doingJsEditor || context.isDestroyed()) {
            return;
        }

        const compDetails = editDetails!.compDetails;
        const isPopup = editDetails!.popup === true;

        const cellEditorPromise = compDetails.newAgStackInstance();

        cellEditorPromise.then((cellEditor: ICellEditorComp) => {
            if (!cellEditor) {
                return;
            }

            const compGui = cellEditor.getGui();

            setCellEditorRef(cellEditor);

            if (!isPopup) {
                const parentEl = (forceWrapper ? eCellWrapper : eGui).current;
                parentEl?.appendChild(compGui);

                cellEditor.afterGuiAttached?.();
            }

            setJsEditorComp(cellEditor);
        });

        return () => {
            cellEditorPromise.then((cellEditor) => {
                const compGui = cellEditor.getGui();
                cellCtrl.disableEditorTooltipFeature();
                context.destroyBean(cellEditor);
                setCellEditorRef(undefined);
                setJsEditorComp(undefined);

                compGui?.remove();
            });
        };
    }, [editDetails]);

    // tool widgets effect
    const setCellWrapperRef = useCallback(
        (eRef: HTMLDivElement | null) => {
            eCellWrapper.current = eRef;

            if (!eRef || context.isDestroyed() || !cellCtrl.isAlive()) {
                const callbacks = cellWrapperDestroyFuncs.current;
                cellWrapperDestroyFuncs.current = [];
                for (const cb of callbacks) {
                    cb();
                }
                return;
            }

            let rowDragComp: RowDragComp | undefined;

            const addComp = (comp: Component | undefined) => {
                if (comp) {
                    eRef.insertAdjacentElement('afterbegin', comp.getGui());
                    cellWrapperDestroyFuncs.current.push(() => {
                        _removeFromParent(comp.getGui());
                        context.destroyBean(comp);
                        if (rowDragCompRef.current === rowDragComp) {
                            rowDragCompRef.current = undefined;
                        }
                    });
                }
            };

            if (includeSelection) {
                addComp(cellCtrl.createSelectionCheckbox());
            }

            if (includeDndSource) {
                addComp(cellCtrl.createDndSource());
            }

            if (includeRowDrag) {
                rowDragComp = cellCtrl.createRowDragComp();
                rowDragCompRef.current = rowDragComp;
                if (rowDragComp) {
                    addComp(rowDragComp);
                    rowDragComp.refreshVisibility();
                }
            }
        },
        [cellCtrl, context, includeDndSource, includeRowDrag, includeSelection]
    );

    const init = useCallback(() => {
        const spanReady = !cellCtrl.isCellSpanning() || eWrapper.current;
        const eRef = eGui.current;
        if (!eRef || !spanReady || !cellCtrl || !cellCtrl.isAlive() || context.isDestroyed()) {
            compBean.current = context.destroyBean(compBean.current);
            return;
        }
        compBean.current = context.createBean(new _EmptyBean());

        const compProxy: ICellComp = {
            toggleCss: (name, on) => cssManager.current!.toggleCss(name, on),
            setUserStyles: (styles: CellStyle) => setUserStyles(styles),
            getFocusableElement: () => eGui.current!,

            setIncludeSelection: (include) => setIncludeSelection(include),
            setIncludeRowDrag: (include) => setIncludeRowDrag(include),
            setIncludeDndSource: (include) => setIncludeDndSource(include),

            getCellEditor: () => cellEditorRef.current || null,
            getCellRenderer: () => cellRendererRef.current ?? jsCellRendererRef.current,
            getParentOfValue: () => eCellValue.current ?? eCellWrapper.current ?? eGui.current,

            setRenderDetails: (compDetails, value, force) => {
                const setDetails = () => {
                    setRenderDetails((prev) => {
                        if (prev?.compDetails !== compDetails || prev?.value !== value || prev?.force !== force) {
                            return {
                                value,
                                compDetails,
                                force,
                            };
                        } else {
                            return prev;
                        }
                    });
                };
                if (compDetails?.params?.deferRender && !cellCtrl.rowNode.group) {
                    const { loadingComp, onReady } = cellCtrl.getDeferLoadingCellRenderer();

                    if (loadingComp) {
                        setRenderDetails({
                            value: undefined,
                            compDetails: loadingComp,
                            force: false,
                        });
                        // Render with startTransition to make it easier to interrupt the expensive components
                        // for example the user starts scrolling after the cells have started to render
                        onReady.then(() => agStartTransition(setDetails));
                        // Returning here as we do not want to set the details immediately
                        return;
                    }
                }
                setDetails();
            },

            setEditDetails: (compDetails, popup, popupPosition, reactiveCustomComponents) => {
                if (compDetails) {
                    let compProxy = undefined;
                    if (compDetails.componentFromFramework) {
                        if (reactiveCustomComponents) {
                            compProxy = new CellEditorComponentProxy(compDetails.params!, () =>
                                setRenderKey((prev) => prev + 1)
                            );
                        } else {
                            warnReactiveCustomComponents();
                        }
                    }
                    // start editing
                    setEditDetails({
                        compDetails,
                        popup,
                        popupPosition,
                        compProxy,
                    });
                    if (!popup) {
                        setRenderDetails(undefined);
                    }
                } else {
                    // if leaving editor & editor is focused, move focus to the cell
                    const recoverFocus = cellCtrl.hasBrowserFocus();
                    if (recoverFocus) {
                        compProxy.getFocusableElement().focus({ preventScroll: true });
                    }
                    // stop editing
                    setEditDetails((editDetails) => {
                        if (editDetails?.compProxy) {
                            // if we're using the proxy, we have to manually clear the ref
                            cellEditorRef.current = undefined;
                        }
                        return undefined;
                    });
                }
            },
            refreshEditStyles: (editing, isPopup) => {
                if (!eGui.current) {
                    return;
                }

                const { current } = cssManager;
                current!.toggleCss('ag-cell-value', !showCellWrapper);
                current!.toggleCss('ag-cell-inline-editing', !!editing && !isPopup);
                current!.toggleCss('ag-cell-popup-editing', !!editing && !!isPopup);
                current!.toggleCss('ag-cell-not-inline-editing', !editing || !!isPopup);
            },
        };

        const cellWrapperOrUndefined = eCellWrapper.current || undefined;
        cellCtrl.setComp(
            compProxy,
            eRef,
            eWrapper.current ?? undefined,
            cellWrapperOrUndefined,
            printLayout,
            editingCell,
            compBean.current
        );
    }, []);

    const setGuiRef = useCallback((ref: HTMLDivElement | null) => {
        eGui.current = ref;
        init();
    }, []);

    const setWrapperRef = useCallback((ref: HTMLDivElement | null) => {
        eWrapper.current = ref;
        init();
    }, []);

    const reactCellRendererStateless = useMemo(() => {
        const res =
            renderDetails?.compDetails?.componentFromFramework &&
            isComponentStateless(renderDetails.compDetails.componentClass);

        return !!res;
    }, [renderDetails]);

    useLayoutEffect(() => {
        if (!eGui.current) {
            return;
        }

        const { current } = cssManager;
        current!.toggleCss('ag-cell-value', !showCellWrapper);
        current!.toggleCss('ag-cell-inline-editing', !!editDetails && !editDetails.popup);
        current!.toggleCss('ag-cell-popup-editing', !!editDetails && !!editDetails.popup);
        current!.toggleCss('ag-cell-not-inline-editing', !editDetails || !!editDetails.popup);
    });

    const valueOrCellComp = () => {
        const { compDetails, value } = renderDetails!;
        if (!compDetails) {
            // No Cell Renderer, so just show the value.
            // if we didn't do this, objects would cause React error. we depend on objects for things
            // like the aggregation functions avg and count, which return objects and depend on toString()
            // getting called.
            return value?.toString?.() ?? value;
        }

        if (compDetails.componentFromFramework) {
            const CellRendererClass = compDetails.componentClass;
            return (
                <Suspense fallback={<SkeletonCellRenderer cellCtrl={cellCtrl} parent={eGui} />}>
                    {reactCellRendererStateless ? (
                        <CellRendererClass {...compDetails.params} key={renderKey} />
                    ) : (
                        <CellRendererClass {...compDetails.params} key={renderKey} ref={cellRendererRef} />
                    )}
                </Suspense>
            );
        }
        // else {
        // If the Cell Renderer is a JS component this will have been handled in the useJsCellRenderer hook above
        // }
    };

    const showCellOrEditor = () => {
        const showCellValue = () => {
            if (renderDetails == null) {
                return null;
            }
            return showCellWrapper ? (
                <span role="presentation" id={`cell-${instanceId}`} className={cellValueClass} ref={setCellValueRef}>
                    {valueOrCellComp()}
                </span>
            ) : (
                valueOrCellComp()
            );
        };

        const showEditValue = (details: EditDetails) =>
            jsxEditValue(details, setCellEditorRef, eGui.current!, cellCtrl, jsEditorComp);

        if (editDetails != null) {
            if (editDetails.popup) {
                return (
                    <>
                        {showCellValue()}
                        {showEditValue(editDetails)}
                    </>
                );
            }

            return showEditValue(editDetails);
        }

        return showCellValue();
    };

    const renderCell = () => (
        <div ref={setGuiRef} style={userStyles} role={cellAriaRole} col-id={colIdSanitised}>
            {showCellWrapper ? (
                <div className="ag-cell-wrapper" role="presentation" ref={setCellWrapperRef}>
                    {showCellOrEditor()}
                </div>
            ) : (
                showCellOrEditor()
            )}
        </div>
    );

    if (cellCtrl.isCellSpanning()) {
        return (
            <div ref={setWrapperRef} className="ag-spanned-cell-wrapper" role="presentation">
                {renderCell()}
            </div>
        );
    }
    return renderCell();
};

export default memo(CellComp);
