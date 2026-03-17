import React, { memo, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type {
    CellCtrl,
    ICellRenderer,
    ICellRendererParams,
    IRowComp,
    RowContainerType,
    RowCtrl,
    RowStyle,
    UserCompDetails,
} from 'ag-grid-community';
import { CssClassManager, _EmptyBean } from 'ag-grid-community';

import { BeansContext, RenderModeContext } from '../beansContext';
import CellComp from '../cells/cellComp';
import { showJsComp } from '../jsComp';
import { agFlushSync, agUseSyncExternalStore, getNextValueIfDifferent, isComponentStateless } from '../utils';

type EmbeddedFullWidthCompDetails = {
    left: UserCompDetails;
    center: UserCompDetails;
    right: UserCompDetails;
};

const RowComp = ({ rowCtrl, containerType }: { rowCtrl: RowCtrl; containerType: RowContainerType }) => {
    const { context, gos, editSvc } = useContext(BeansContext);

    const enableUses = useContext(RenderModeContext) === 'default';

    const compBean = useRef<_EmptyBean>();

    const domOrderRef = useRef<boolean>(rowCtrl.getDomOrder());
    const isFullWidth = rowCtrl.isFullWidth();

    // Flag used to avoid problematic initialState setter funcs being called on a dead / non displayed row.
    // Due to async rendering its possible for the row to be destroyed before React has had a chance to render it.
    const isDisplayed = rowCtrl.rowNode.displayed;
    const [rowIndex, setRowIndex] = useState<string | null>(() =>
        isDisplayed ? rowCtrl.rowNode.getRowIndexString() : null
    );
    const [rowId, setRowId] = useState<string | null>(() => rowCtrl.rowId);
    const [rowBusinessKey, setRowBusinessKey] = useState<string | null>(() => rowCtrl.businessKey);
    const [userStyles, setUserStyles] = useState<RowStyle | undefined>(() => rowCtrl.rowStyles);
    const cellCtrlsRef = useRef<CellCtrl[] | null>(null);
    const [cellCtrlsFlushSync, setCellCtrlsFlushSync] = useState<CellCtrl[] | null>(() => null);
    const [fullWidthCompDetails, setFullWidthCompDetails] = useState<UserCompDetails>();
    const [embeddedFullWidthCompDetails, setEmbeddedFullWidthCompDetails] = useState<EmbeddedFullWidthCompDetails>();

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
    const isEmbeddedFullWidthRef = useRef(false);
    const fullWidthParamsRef = useRef<ICellRendererParams>();
    const fullWidthEmbeddedLeftParamsRef = useRef<ICellRendererParams>();
    const fullWidthEmbeddedCenterParamsRef = useRef<ICellRendererParams>();
    const fullWidthEmbeddedRightParamsRef = useRef<ICellRendererParams>();
    const [embeddedSectionHasContent, setEmbeddedSectionHasContent] = useState({
        left: true,
        center: true,
        right: true,
    });
    const embeddedSectionHasContentRef = useRef(embeddedSectionHasContent);

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

    // Setup both approaches to avoid conditionally rendering Hooks even though we don't use both at the same time.
    const cellsChanged = useRef<any>(() => {});
    const sub = useCallback((onStoreChange: any) => {
        cellsChanged.current = onStoreChange;
        return () => {
            cellsChanged.current = () => {};
        };
    }, []);
    const cellCtrlsUses = agUseSyncExternalStore(
        sub,
        () => {
            return cellCtrlsRef.current;
        },
        []
    );

    // Will only use useSyncExternalStore if it is supported by the React version and the rendering mode has not been set to 'legacy
    const cellCtrlsMerged = enableUses ? cellCtrlsUses : cellCtrlsFlushSync;

    const setRef = useCallback((eRef: HTMLDivElement | null) => {
        eGui.current = eRef;
        compBean.current = eRef ? context.createBean(new _EmptyBean()) : context.destroyBean(compBean.current);

        if (!eRef) {
            rowCtrl.unsetComp(containerType);
            return;
        }

        // because React is asynchronous, it's possible the RowCtrl is no longer a valid RowCtrl. This can
        // happen if user calls two API methods one after the other, with the second API invalidating the rows
        // the first call created. Thus the rows for the first call could still get created even though no longer needed.
        if (!rowCtrl.isAlive() || context.isDestroyed()) {
            return;
        }

        const compProxy: IRowComp = {
            // the rowTop is managed by state, instead of direct style manipulation by rowCtrl (like all the other styles)
            // as we need to have an initial value when it's placed into he DOM for the first time, for animation to work.
            setTop,
            setTransform,

            // i found using React for managing classes at the row level was to slow, as modifying classes caused a lot of
            // React code to execute, so avoiding React for managing CSS Classes made the grid go much faster.
            toggleCss: (name, on) => cssManager.current!.toggleCss(name, on),

            setDomOrder: (domOrder) => (domOrderRef.current = domOrder),
            setRowIndex,
            setRowId,
            setRowBusinessKey,
            setUserStyles,
            // if we don't maintain the order, then cols will be ripped out and into the dom
            // when cols reordered, which would stop the CSS transitions from working
            setCellCtrls: (next, useFlushSync) => {
                const prevCellCtrls = cellCtrlsRef.current;
                const nextCells = getNextValueIfDifferent(prevCellCtrls, next, domOrderRef.current);
                if (nextCells !== prevCellCtrls) {
                    cellCtrlsRef.current = nextCells;
                    if (enableUses) {
                        cellsChanged.current();
                    } else {
                        agFlushSync(useFlushSync, () => setCellCtrlsFlushSync(nextCells));
                    }
                }
            },
            getPinnedLeftRowElement: () => ePinnedLeftCells.current ?? undefined,
            getScrollingRowElement: () => eScrollingCells.current ?? undefined,
            getPinnedRightRowElement: () => ePinnedRightCells.current ?? undefined,
            showFullWidth: (compDetails) => {
                isEmbeddedFullWidthRef.current = false;
                setEmbeddedFullWidthCompDetails(undefined);
                setEmbeddedSectionHasContent({ left: true, center: true, right: true });
                fullWidthParamsRef.current = compDetails.params;
                setFullWidthCompDetails(compDetails);
            },
            showEmbeddedFullWidth: (compDetails) => {
                isEmbeddedFullWidthRef.current = true;
                setFullWidthCompDetails(undefined);
                setEmbeddedSectionHasContent({ left: true, center: true, right: true });
                fullWidthEmbeddedLeftParamsRef.current = compDetails.left.params;
                fullWidthEmbeddedCenterParamsRef.current = compDetails.center.params;
                fullWidthEmbeddedRightParamsRef.current = compDetails.right.params;
                setEmbeddedFullWidthCompDetails(compDetails);
            },
            getFullWidthCellRenderer: () => fullWidthCompRef.current ?? fullWidthEmbeddedCenterCompRef.current,
            getFullWidthCellRendererParams: () =>
                fullWidthParamsRef.current ?? fullWidthEmbeddedCenterParamsRef.current,
            getFullWidthCellRendererParamsForPinned: (pinned) =>
                pinned === 'left'
                    ? fullWidthEmbeddedLeftParamsRef.current
                    : pinned === 'right'
                      ? fullWidthEmbeddedRightParamsRef.current
                      : fullWidthEmbeddedCenterParamsRef.current,
            mapPinnedCellGroupWidths: (widths) => {
                if (!isEmbeddedFullWidthRef.current) {
                    return widths;
                }
                const hasLeft = embeddedSectionHasContentRef.current.left;
                const hasRight = embeddedSectionHasContentRef.current.right;
                return {
                    leftWidth: hasLeft ? widths.leftWidth : 0,
                    centerWidth:
                        widths.centerWidth + (hasLeft ? 0 : widths.leftWidth) + (hasRight ? 0 : widths.rightWidth),
                    rightWidth: hasRight ? widths.rightWidth : 0,
                };
            },
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

                const leftRefreshed = leftRef?.refresh?.(leftParams) ?? !embeddedSectionHasContentRef.current.left;
                const centerRefreshed = centerRef?.refresh?.(centerParams) ?? true;
                const rightRefreshed = rightRef?.refresh?.(rightParams) ?? !embeddedSectionHasContentRef.current.right;

                return leftRefreshed && centerRefreshed && rightRefreshed;
            },
        };
        rowCtrl.setComp(compProxy, eRef, containerType, compBean.current);
    }, []);

    const showEmbeddedFullWidth = isFullWidth && !!embeddedFullWidthCompDetails;

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
    const showCells = !isFullWidth && cellCtrlsMerged != null;

    const { leftCellCtrls, centerCellCtrls, rightCellCtrls } = useMemo(() => {
        const left: CellCtrl[] = [];
        const center: CellCtrl[] = [];
        const right: CellCtrl[] = [];

        for (const cellCtrl of cellCtrlsMerged ?? []) {
            const pinned = cellCtrl.column.getPinned();
            if (pinned === 'left') {
                left.push(cellCtrl);
            } else if (pinned === 'right') {
                right.push(cellCtrl);
            } else {
                center.push(cellCtrl);
            }
        }

        return {
            leftCellCtrls: left,
            centerCellCtrls: center,
            rightCellCtrls: right,
        };
    }, [cellCtrlsMerged]);

    const { leftWidth, centerWidth, rightWidth } = useMemo(() => {
        const baseWidths = rowCtrl.getPinnedCellGroupWidths();
        if (!showEmbeddedFullWidth) {
            return baseWidths;
        }

        const hasLeft = embeddedSectionHasContent.left;
        const hasRight = embeddedSectionHasContent.right;
        return {
            leftWidth: hasLeft ? baseWidths.leftWidth : 0,
            centerWidth:
                baseWidths.centerWidth + (hasLeft ? 0 : baseWidths.leftWidth) + (hasRight ? 0 : baseWidths.rightWidth),
            rightWidth: hasRight ? baseWidths.rightWidth : 0,
        };
    }, [rowCtrl, showEmbeddedFullWidth, embeddedSectionHasContent]);

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
    useEffect(() => {
        embeddedSectionHasContentRef.current = embeddedSectionHasContent;
    }, [embeddedSectionHasContent]);

    const showCellsJsx = (cellCtrls: CellCtrl[]) =>
        cellCtrls.map((cellCtrl) => (
            <CellComp
                cellCtrl={cellCtrl}
                editingCell={editSvc?.isEditing(cellCtrl, { withOpenEditor: true }) ?? false}
                printLayout={rowCtrl.printLayout}
                key={cellCtrl.instanceId}
            />
        ));

    const showFullWidthFrameworkJsx = () => {
        const FullWidthComp = fullWidthCompDetails!.componentClass;
        return reactFullWidthCellRendererStateless ? (
            <FullWidthComp {...fullWidthCompDetails!.params} />
        ) : (
            <FullWidthComp {...fullWidthCompDetails!.params} ref={fullWidthCompRef} />
        );
    };

    const showEmbeddedFrameworkSection = (section: 'left' | 'center' | 'right') => {
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

    return (
        <div
            ref={setRef}
            role={'row'}
            style={rowStyles}
            row-index={rowIndex}
            row-id={rowId}
            row-business-key={rowBusinessKey}
        >
            {showCells ? (
                <>
                    <div
                        className="ag-grid-pinned-left-cells"
                        role="presentation"
                        ref={ePinnedLeftCells}
                        style={{ width: leftWidth || undefined, display: leftWidth > 0 ? undefined : 'none' }}
                    >
                        {showCellsJsx(leftCellCtrls)}
                    </div>
                    <div
                        className="ag-grid-scrolling-cells"
                        role="presentation"
                        ref={eScrollingCells}
                        style={{ width: centerWidth }}
                    >
                        {showCellsJsx(centerCellCtrls)}
                    </div>
                    <div
                        className="ag-grid-pinned-right-cells"
                        role="presentation"
                        ref={ePinnedRightCells}
                        style={{ width: rightWidth || undefined, display: rightWidth > 0 ? undefined : 'none' }}
                    >
                        {showCellsJsx(rightCellCtrls)}
                    </div>
                </>
            ) : showEmbeddedFullWidth ? (
                <>
                    <div
                        className="ag-grid-pinned-left-cells"
                        role="presentation"
                        ref={ePinnedLeftCells}
                        style={{ width: leftWidth || undefined, display: leftWidth > 0 ? undefined : 'none' }}
                    >
                        {showEmbeddedFrameworkSection('left')}
                    </div>
                    <div
                        className="ag-grid-scrolling-cells"
                        role="presentation"
                        ref={eScrollingCells}
                        style={{ width: centerWidth }}
                    >
                        {showEmbeddedFrameworkSection('center')}
                    </div>
                    <div
                        className="ag-grid-pinned-right-cells"
                        role="presentation"
                        ref={ePinnedRightCells}
                        style={{ width: rightWidth || undefined, display: rightWidth > 0 ? undefined : 'none' }}
                    >
                        {showEmbeddedFrameworkSection('right')}
                    </div>
                </>
            ) : showFullWidthFramework ? (
                <div className="ag-full-width-anchor" role="presentation" ref={eFullWidthAnchor}>
                    {showFullWidthFrameworkJsx()}
                </div>
            ) : isFullWidth ? (
                <div className="ag-full-width-anchor" role="presentation" ref={eFullWidthAnchor} />
            ) : null}
        </div>
    );
};

export default memo(RowComp);
