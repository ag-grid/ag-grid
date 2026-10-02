import { CssClassManager } from 'ag-stack';
import React, { memo, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type {
    BeanCollection,
    CellCtrl,
    HorizontalSection,
    HorizontalSectionMap,
    ICellRenderer,
    ICellRendererParams,
    IRowComp,
    PinnedCellGroupWidths,
    RowCtrl,
    RowStyle,
    UserCompDetails,
} from 'ag-grid-community';
import { _EmptyBean } from 'ag-grid-community';

import { BeansContext, RenderModeContext } from '../beansContext';
import CellComp from '../cells/cellComp';
import { showJsComp } from '../jsComp';
import { agFlushSync, agUseSyncExternalStore, getNextValueIfDifferent, isComponentStateless } from '../utils';

const RowComp = ({ rowCtrl }: { rowCtrl: RowCtrl }) => {
    const { context, gos } = useContext(BeansContext);

    const enableUses = useContext(RenderModeContext) === 'default';

    const compBean = useRef<_EmptyBean>();

    const domOrderRef = useRef<boolean>(rowCtrl.getDomOrder());
    const isFullWidth = rowCtrl.isFullWidth();
    const fullWidthAnchorRole = rowCtrl.getFullWidthAnchorRole();

    // Flag used to avoid problematic initialState setter funcs being called on a dead / non displayed row.
    // Due to async rendering its possible for the row to be destroyed before React has had a chance to render it.
    const isDisplayed = rowCtrl.rowNode.displayed;
    const [rowIndex, setRowIndex] = useState<string | null>(() =>
        isDisplayed ? rowCtrl.rowNode.getRowIndexString() : null
    );
    const [rowId, setRowId] = useState<string | null>(() => rowCtrl.rowId);
    const [rowBusinessKey, setRowBusinessKey] = useState<string | null>(() => rowCtrl.businessKey);
    const [userStyles, setUserStyles] = useState<RowStyle | undefined>(() => rowCtrl.rowStyles);
    const [lanes] = useState(() => [
        new CellLane(rowCtrl.getInitialCellCtrls(0)),
        new CellLane(rowCtrl.getInitialCellCtrls(1)),
        new CellLane(rowCtrl.getInitialCellCtrls(2)),
    ]);
    const [fullWidthCompDetails, setFullWidthCompDetails] = useState<UserCompDetails>();
    const [embeddedFullWidthCompDetails, setEmbeddedFullWidthCompDetails] =
        useState<HorizontalSectionMap<UserCompDetails>>();
    const embeddedFullWidthCompDetailsRef = useRef<HorizontalSectionMap<UserCompDetails>>();

    // these styles have initial values, so element is placed into the DOM with them,
    // rather than an transition getting applied.
    const [top, setTop] = useState<string | undefined>(() => (isDisplayed ? rowCtrl.getInitialRowTop() : undefined));
    const [transform, setTransform] = useState<string | undefined>(() =>
        isDisplayed ? rowCtrl.getInitialTransform() : undefined
    );

    const eGui = useRef<HTMLDivElement | null>(null);
    const eFullWidthAnchor = useRef<HTMLDivElement | null>(null);
    const ePinnedLeftCells = useRef<HTMLDivElement | null>(null);
    const eScrollingCells = useRef<HTMLDivElement | null>(null);
    const ePinnedRightCells = useRef<HTMLDivElement | null>(null);
    const fullWidthCompRef = useRef<ICellRenderer>();
    const fullWidthEmbeddedLeftCompRef = useRef<ICellRenderer>();
    const fullWidthEmbeddedCenterCompRef = useRef<ICellRenderer>();
    const fullWidthEmbeddedRightCompRef = useRef<ICellRenderer>();
    const fullWidthParamsRef = useRef<ICellRendererParams>();
    const fullWidthEmbeddedLeftParamsRef = useRef<ICellRendererParams>();
    const fullWidthEmbeddedCenterParamsRef = useRef<ICellRendererParams>();
    const fullWidthEmbeddedRightParamsRef = useRef<ICellRendererParams>();
    const [, setEmbeddedSectionHasContent] = useState(() => rowCtrl.embeddedSectionHasContent);
    // the row ctrl returns the same widths object while they are unchanged, so setting it again is a no-op
    const [, setPinnedWidths] = useState<PinnedCellGroupWidths>(() => rowCtrl.getMappedPinnedCellGroupWidths());

    const autoHeightSetup = useRef<boolean>(false);
    const [autoHeightSetupAttempt, setAutoHeightSetupAttempt] = useState<number>(0);

    // puts autoHeight onto full with detail rows. this needs trickery, as we need
    // the HTMLElement for the provided Detail Cell Renderer, however the Detail Cell Renderer
    // could be a stateless React Func Comp which won't work with useRef, so we need
    // to poll (we limit to 10) looking for the Detail HTMLElement (which will be the only
    // child) after the fullWidthCompDetails is set.
    // I think this looping could be avoided if we use a ref Callback instead of useRef,
    useEffect(() => {
        if (autoHeightSetup.current || !fullWidthCompDetails || autoHeightSetupAttempt > 10) {
            return;
        }

        const eChild = eFullWidthAnchor.current?.firstChild as HTMLElement;
        if (eChild) {
            rowCtrl.setupDetailRowAutoHeight(eChild);
            autoHeightSetup.current = true;
        } else {
            setAutoHeightSetupAttempt((prev) => prev + 1);
        }
    }, [fullWidthCompDetails, autoHeightSetupAttempt]);

    const cssManager = useRef<CssClassManager>();
    if (!cssManager.current) {
        cssManager.current = new CssClassManager(() => eGui.current);
    }

    const setRef = useCallback((eRef: HTMLDivElement | null) => {
        eGui.current = eRef;
        compBean.current = eRef ? context.createBean(new _EmptyBean()) : context.destroyBean(compBean.current);

        if (!eRef) {
            rowCtrl.unsetComp();
            return;
        }

        // because React is asynchronous, it's possible the RowCtrl is no longer a valid RowCtrl. This can
        // happen if user calls two API methods one after the other, with the second API invalidating the rows
        // the first call created. Thus the rows for the first call could still get created even though no longer needed.
        if (!rowCtrl.isAlive() || context.isDestroyed()) {
            return;
        }

        const notifyLanes = () => {
            lanes[0].notify();
            lanes[1].notify();
            lanes[2].notify();
        };
        const compProxy: IRowComp = {
            // the rowTop is managed by state, instead of direct style manipulation by rowCtrl (like all the other styles)
            // as we need to have an initial value when it's placed into he DOM for the first time, for animation to work.
            setTop,
            setTransform,

            // i found using React for managing classes at the row level was to slow, as modifying classes caused a lot of
            // React code to execute, so avoiding React for managing CSS Classes made the grid go much faster.
            toggleCss: (name, on) => cssManager.current!.toggleCss(name, on),

            // TODO: ensureDomOrder is documented as initial, yet rows follow a prop change; investigate whether to
            // make it truly initial, which would let this go with RowCtrl's listener.
            setDomOrder: (domOrder) => {
                const turnedOn = domOrder && !domOrderRef.current;
                domOrderRef.current = domOrder;
                if (!turnedOn) {
                    return;
                }
                // an unchanged lane is not given again, so one shown unordered is put in order here
                let changed = lanes[0].order();
                changed = lanes[1].order() || changed;
                changed = lanes[2].order() || changed;
                if (!changed) {
                    return;
                }
                notifyLanes();
            },
            setRowIndex,
            setRowId,
            setRowBusinessKey,
            setUserStyles,
            // if we don't maintain the order, then cols will be ripped out and into the dom
            // when cols reordered, which would stop the CSS transitions from working
            setCellCtrls: (left, center, right, useFlushSync, colsVersion) => {
                const domOrder = domOrderRef.current;
                let changed = lanes[0].take(left, colsVersion, domOrder);
                changed = lanes[1].take(center, colsVersion, domOrder) || changed;
                changed = lanes[2].take(right, colsVersion, domOrder) || changed;
                if (!changed) {
                    return;
                }
                // the changed lanes go in one commit
                if (enableUses) {
                    notifyLanes();
                } else {
                    agFlushSync(useFlushSync, notifyLanes);
                }
            },
            getPinnedLeftRowElement: () => ePinnedLeftCells.current ?? undefined,
            getScrollingRowElement: () => eScrollingCells.current ?? undefined,
            getPinnedRightRowElement: () => ePinnedRightCells.current ?? undefined,
            refreshPinnedSections: () => {
                const widths = rowCtrl.getMappedPinnedCellGroupWidths();
                const eCenter = eScrollingCells.current;
                // a pinned section's width is on the element around its lane
                const eLeft = ePinnedLeftCells.current?.parentElement;
                const eRight = ePinnedRightCells.current?.parentElement;
                if (!eCenter || widths.renderLeft !== !!eLeft || widths.renderRight !== !!eRight) {
                    setPinnedWidths(widths);
                    return;
                }
                // written as the vanilla row does, so a width change alone renders no row again
                eCenter.style.width = `${widths.centerWidth}px`;
                eLeft?.style.setProperty('width', `${widths.leftWidth}px`);
                eRight?.style.setProperty('width', `${widths.rightWidth}px`);
            },
            showFullWidth: (compDetails) => {
                embeddedFullWidthCompDetailsRef.current = undefined;
                setEmbeddedFullWidthCompDetails(undefined);
                setEmbeddedSectionHasContent({ left: true, center: true, right: true });
                fullWidthParamsRef.current = compDetails.params;
                setFullWidthCompDetails(compDetails);
            },
            showEmbeddedFullWidth: (compDetails) => {
                setFullWidthCompDetails(undefined);
                setEmbeddedSectionHasContent({ left: true, center: true, right: true });
                fullWidthEmbeddedLeftParamsRef.current = compDetails.left.params;
                fullWidthEmbeddedCenterParamsRef.current = compDetails.center.params;
                fullWidthEmbeddedRightParamsRef.current = compDetails.right.params;
                embeddedFullWidthCompDetailsRef.current = compDetails;
                setEmbeddedFullWidthCompDetails(compDetails);
            },
            getFullWidthCellRenderers: () => {
                if (rowCtrl.isEmbeddedFullWidth) {
                    return [
                        fullWidthEmbeddedLeftCompRef.current,
                        fullWidthEmbeddedCenterCompRef.current,
                        fullWidthEmbeddedRightCompRef.current,
                    ];
                }
                const renderer = fullWidthCompRef.current;
                return renderer ? [renderer] : undefined;
            },
            getFullWidthCellRendererParams: () =>
                fullWidthParamsRef.current ?? fullWidthEmbeddedCenterParamsRef.current,
            getFullWidthCellRendererParamsForPinned: (pinned) =>
                pinned === 'left'
                    ? fullWidthEmbeddedLeftParamsRef.current
                    : pinned === 'right'
                      ? fullWidthEmbeddedRightParamsRef.current
                      : fullWidthEmbeddedCenterParamsRef.current,
            refreshFullWidth: (getUpdatedParams) => {
                const fullWidthParams = getUpdatedParams();
                fullWidthParamsRef.current = fullWidthParams;
                if (canRefreshFullWidthRef.current) {
                    setFullWidthCompDetails((prevFullWidthCompDetails) => ({
                        ...prevFullWidthCompDetails!,
                        params: fullWidthParams,
                    }));
                    return true;
                } else {
                    if (!fullWidthCompRef.current || !fullWidthCompRef.current.refresh) {
                        return false;
                    }
                    return fullWidthCompRef.current.refresh(fullWidthParams);
                }
            },
            refreshEmbeddedFullWidth: (getUpdatedParams) => {
                const leftParams = getUpdatedParams('left');
                const centerParams = getUpdatedParams(null);
                const rightParams = getUpdatedParams('right');

                fullWidthEmbeddedLeftParamsRef.current = leftParams;
                fullWidthEmbeddedCenterParamsRef.current = centerParams;
                fullWidthEmbeddedRightParamsRef.current = rightParams;

                const leftRef = fullWidthEmbeddedLeftCompRef.current;
                const centerRef = fullWidthEmbeddedCenterCompRef.current;
                const rightRef = fullWidthEmbeddedRightCompRef.current;

                const currentDetails = embeddedFullWidthCompDetailsRef.current;
                let nextDetails: HorizontalSectionMap<UserCompDetails> | undefined;

                const refreshSection = (
                    section: HorizontalSection,
                    params: ICellRendererParams,
                    renderer: ICellRenderer | undefined,
                    hasContent: boolean
                ): boolean => {
                    const details = currentDetails?.[section];
                    const isStatelessFrameworkRenderer =
                        !!details?.componentFromFramework && isComponentStateless(details.componentClass);

                    if (isStatelessFrameworkRenderer) {
                        if (!gos.get('reactiveCustomComponents') || !currentDetails) {
                            return false;
                        }

                        nextDetails ??= { ...currentDetails };
                        nextDetails[section] = { ...details, params };
                        return true;
                    }

                    return renderer?.refresh?.(params) ?? !hasContent;
                };

                const leftRefreshed = refreshSection(
                    'left',
                    leftParams,
                    leftRef,
                    rowCtrl.embeddedSectionHasContent.left
                );
                const centerRefreshed = refreshSection('center', centerParams, centerRef, true);
                const rightRefreshed = refreshSection(
                    'right',
                    rightParams,
                    rightRef,
                    rowCtrl.embeddedSectionHasContent.right
                );

                if (nextDetails) {
                    embeddedFullWidthCompDetailsRef.current = nextDetails;
                    setEmbeddedFullWidthCompDetails(nextDetails);
                }

                return leftRefreshed && centerRefreshed && rightRefreshed;
            },
        };
        rowCtrl.setComp(compProxy, eRef, compBean.current);
    }, []);

    const showEmbeddedFullWidth = isFullWidth && rowCtrl.shouldCreateCellSections();

    useLayoutEffect(
        () => showJsComp(fullWidthCompDetails, context, eFullWidthAnchor.current ?? eGui.current!, fullWidthCompRef),
        [fullWidthCompDetails]
    );
    useLayoutEffect(() => {
        if (!ePinnedLeftCells.current) {
            return;
        }
        return showJsComp(
            embeddedFullWidthCompDetails?.left,
            context,
            ePinnedLeftCells.current,
            fullWidthEmbeddedLeftCompRef
        );
    }, [embeddedFullWidthCompDetails?.left]);
    useLayoutEffect(() => {
        if (!eScrollingCells.current) {
            return;
        }
        return showJsComp(
            embeddedFullWidthCompDetails?.center,
            context,
            eScrollingCells.current,
            fullWidthEmbeddedCenterCompRef
        );
    }, [embeddedFullWidthCompDetails?.center]);
    useLayoutEffect(() => {
        if (!ePinnedRightCells.current) {
            return;
        }
        return showJsComp(
            embeddedFullWidthCompDetails?.right,
            context,
            ePinnedRightCells.current,
            fullWidthEmbeddedRightCompRef
        );
    }, [embeddedFullWidthCompDetails?.right]);
    useLayoutEffect(() => {
        if (!showEmbeddedFullWidth) {
            return;
        }
        const updateLaneVisibility = () => {
            const next = {
                left: !!ePinnedLeftCells.current?.firstElementChild,
                center: !!eScrollingCells.current?.firstElementChild,
                right: !!ePinnedRightCells.current?.firstElementChild,
            };
            rowCtrl.embeddedSectionHasContent = next;
            setEmbeddedSectionHasContent((prev) =>
                prev.left === next.left && prev.center === next.center && prev.right === next.right ? prev : next
            );
        };

        updateLaneVisibility();
        const observer = new MutationObserver(updateLaneVisibility);
        if (ePinnedLeftCells.current) {
            observer.observe(ePinnedLeftCells.current, { childList: true });
        }
        if (eScrollingCells.current) {
            observer.observe(eScrollingCells.current, { childList: true });
        }
        if (ePinnedRightCells.current) {
            observer.observe(ePinnedRightCells.current, { childList: true });
        }

        return () => observer.disconnect();
    }, [showEmbeddedFullWidth, embeddedFullWidthCompDetails]);

    const rowStyles = useMemo(() => {
        const res = { top, transform };

        Object.assign(res, userStyles);
        return res;
    }, [top, transform, userStyles]);

    const showFullWidthFramework = isFullWidth && fullWidthCompDetails?.componentFromFramework;
    const showCells = !isFullWidth;
    const Lane = enableUses ? CellsLane : CellsLaneLegacy;
    const showLane = (cellLane: CellLane) => <Lane cellLane={cellLane} printLayout={rowCtrl.printLayout} />;

    const { leftWidth, centerWidth, rightWidth, renderLeft, renderRight } = rowCtrl.getMappedPinnedCellGroupWidths();

    const reactFullWidthCellRendererStateless = useMemo(() => {
        const res =
            fullWidthCompDetails?.componentFromFramework && isComponentStateless(fullWidthCompDetails.componentClass);
        return !!res;
    }, [fullWidthCompDetails]);

    // needs to be a ref to avoid stale closure, as used in compProxy passed to row ctrl
    const canRefreshFullWidthRef = useRef(false);
    useEffect(() => {
        canRefreshFullWidthRef.current =
            reactFullWidthCellRendererStateless && !!fullWidthCompDetails && !!gos.get('reactiveCustomComponents');
    }, [reactFullWidthCellRendererStateless, fullWidthCompDetails]);

    const showFullWidthFrameworkJsx = () => {
        const FullWidthComp = fullWidthCompDetails!.componentClass;
        return reactFullWidthCellRendererStateless ? (
            <FullWidthComp {...fullWidthCompDetails!.params} />
        ) : (
            <FullWidthComp {...fullWidthCompDetails!.params} ref={fullWidthCompRef} />
        );
    };

    const showEmbeddedFrameworkSection = (section: HorizontalSection) => {
        const details = embeddedFullWidthCompDetails?.[section];
        if (!details?.componentFromFramework) {
            return null;
        }

        const FullWidthComp = details.componentClass;
        const compRef =
            section === 'left'
                ? fullWidthEmbeddedLeftCompRef
                : section === 'right'
                  ? fullWidthEmbeddedRightCompRef
                  : fullWidthEmbeddedCenterCompRef;
        const stateless = isComponentStateless(details.componentClass);
        return stateless ? <FullWidthComp {...details.params} /> : <FullWidthComp {...details.params} ref={compRef} />;
    };

    const renderCellSection = (
        sectionClass: string,
        ref: React.Ref<HTMLDivElement>,
        width: number,
        children: React.ReactNode,
        pinned: boolean = false,
        shouldRender: boolean = true
    ) => {
        if (!shouldRender) {
            return null;
        }
        if (pinned) {
            return (
                <div className={sectionClass} role="presentation" style={{ width: `${width}px` }}>
                    <div className="ag-grid-container-wrapper" role="presentation" ref={ref}>
                        {children}
                    </div>
                </div>
            );
        }
        return (
            <div className={sectionClass} role="presentation" ref={ref} style={{ width: `${width}px` }}>
                {children}
            </div>
        );
    };

    return (
        <div
            ref={setRef}
            role={'row'}
            style={rowStyles}
            row-index={rowIndex}
            row-id={rowId}
            row-business-key={rowBusinessKey}
        >
            {showCells || showEmbeddedFullWidth ? (
                <>
                    {renderCellSection(
                        'ag-grid-pinned-left-cells',
                        ePinnedLeftCells,
                        leftWidth,
                        showCells ? showLane(lanes[0]) : showEmbeddedFrameworkSection('left'),
                        true,
                        renderLeft
                    )}
                    {renderCellSection(
                        'ag-grid-scrolling-cells',
                        eScrollingCells,
                        centerWidth,
                        showCells ? showLane(lanes[1]) : showEmbeddedFrameworkSection('center')
                    )}
                    {renderCellSection(
                        'ag-grid-pinned-right-cells',
                        ePinnedRightCells,
                        rightWidth,
                        showCells ? showLane(lanes[2]) : showEmbeddedFrameworkSection('right'),
                        true,
                        renderRight
                    )}
                </>
            ) : showFullWidthFramework ? (
                <div className="ag-full-width-anchor" role={fullWidthAnchorRole} ref={eFullWidthAnchor}>
                    {showFullWidthFrameworkJsx()}
                </div>
            ) : isFullWidth ? (
                <div className="ag-full-width-anchor" role={fullWidthAnchorRole} ref={eFullWidthAnchor} />
            ) : null}
        </div>
    );
};

class CellLane {
    /** The list the row last gave, and the columns version it was laid out at. */
    private given: CellCtrl[] | undefined = undefined;
    private colsVersion = -1;
    /** The cells changed since the mounted lane was last told. */
    private pending = false;
    /** Set by the mounted lane: the store change in the default render mode, the state setter in legacy mode. */
    public changed: (cells: CellCtrl[] | undefined) => void = NOOP;

    public constructor(public cells: CellCtrl[] | undefined) {}

    public take(next: CellCtrl[], colsVersion: number, domOrder: boolean): boolean {
        const given = this.given;
        if (next === given) {
            return false;
        }
        const prev = this.cells;
        // showing the row's own list, laid out at the same columns: `next` already keeps its cells in order
        const cells =
            prev === given && colsVersion === this.colsVersion
                ? next
                : getNextValueIfDifferent(prev, next, domOrder, true);
        this.given = next;
        this.colsVersion = colsVersion;
        if (cells === prev) {
            return false;
        }
        this.cells = cells;
        this.pending = true;
        return true;
    }

    /** Shows the list the row last gave, which keeps its cells in column order. */
    public order(): boolean {
        const given = this.given;
        if (given === undefined || this.cells === given) {
            return false;
        }
        this.cells = given;
        this.pending = true;
        return true;
    }

    public notify(): void {
        if (this.pending) {
            this.pending = false;
            this.changed(this.cells);
        }
    }

    /** Bound once, so the store sees the same functions on every render. */
    public readonly subscribe = (onStoreChange: () => void): (() => void) => {
        this.changed = onStoreChange;
        return () => {
            this.changed = NOOP;
        };
    };
    public readonly getCells = (): CellCtrl[] | undefined => this.cells;
}

const NOOP = () => {};

interface CellsLaneProps {
    cellLane: CellLane;
    printLayout: boolean;
}

/** One lane of a row's cells, rendered on its own so a change to one lane leaves the others alone. */
const CellsLaneComp = ({ cellLane, printLayout }: CellsLaneProps) => {
    const cells = agUseSyncExternalStore(cellLane.subscribe, cellLane.getCells, undefined);
    return renderCells(useContext(BeansContext), cells, printLayout);
};

/** The legacy render mode has no store, so the row sets the lane's state. */
const CellsLaneLegacyComp = ({ cellLane, printLayout }: CellsLaneProps) => {
    const [cells, setCells] = useState(cellLane.cells);
    useLayoutEffect(() => {
        cellLane.changed = setCells;
        // the row may have given cells between this lane's first render and now
        if (cellLane.cells !== cells) {
            setCells(cellLane.cells);
        }
        return () => {
            cellLane.changed = NOOP;
        };
    }, [cellLane]);
    return renderCells(useContext(BeansContext), cells, printLayout);
};

const renderCells = (beans: BeanCollection, cells: CellCtrl[] | undefined, printLayout: boolean) => {
    if (!cells) {
        return null;
    }
    const editSvc = beans.editSvc;
    // asked once per lane, so a grid with nothing in edit asks nothing per cell
    const editSvcIfEditing = editSvc?.isEditing() ? editSvc : undefined;
    return (
        <>
            {cells.map((cellCtrl) => (
                <CellComp
                    cellCtrl={cellCtrl}
                    editingCell={editSvcIfEditing?.isEditing(cellCtrl, WITH_OPEN_EDITOR) ?? false}
                    printLayout={printLayout}
                    key={cellCtrl.instanceId}
                />
            ))}
        </>
    );
};

const WITH_OPEN_EDITOR = { withOpenEditor: true };

const CellsLane = memo(CellsLaneComp);
const CellsLaneLegacy = memo(CellsLaneLegacyComp);

export default memo(RowComp);
