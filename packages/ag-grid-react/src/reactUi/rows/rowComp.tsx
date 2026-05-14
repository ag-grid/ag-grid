import React, { memo, useCallback, useContext, useMemo, useRef, useState } from 'react';

import type { CellCtrl, IRowComp, RowContainerType, RowCtrl, RowStyle } from 'ag-grid-community';
import { CssClassManager, _EmptyBean } from 'ag-grid-community';

import { BeansContext, RenderModeContext } from '../beansContext';
import CellComp from '../cells/cellComp';
import { agFlushSync, agUseSyncExternalStore, getNextValueIfDifferent } from '../utils';
import { useFullWidthRenderers } from './useFullWidthRenderers';

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
    // Seeded so bulk-add doesn't flash empty rows; getInitialCellCtrls returns
    // null when creation is deferred or not applicable.
    const [cellCtrlsFlushSync, setCellCtrlsFlushSync] = useState<CellCtrl[] | null>(() =>
        rowCtrl.getInitialCellCtrls(containerType)
    );
    const cellCtrlsRef = useRef<CellCtrl[] | null>(cellCtrlsFlushSync);

    // these styles have initial values, so element is placed into the DOM with them,
    // rather than an transition getting applied.
    const [top, setTop] = useState<string | undefined>(() => (isDisplayed ? rowCtrl.getInitialRowTop() : undefined));
    const [transform, setTransform] = useState<string | undefined>(() =>
        isDisplayed ? rowCtrl.getInitialTransform() : undefined
    );

    const eGui = useRef<HTMLDivElement | null>(null);
    const ePinnedLeftSection = useRef<HTMLDivElement | null>(null);
    const ePinnedLeftCells = useRef<HTMLDivElement | null>(null);
    const eScrollingCells = useRef<HTMLDivElement | null>(null);
    const ePinnedRightSection = useRef<HTMLDivElement | null>(null);
    const ePinnedRightCells = useRef<HTMLDivElement | null>(null);

    const {
        proxyMethods: fullWidthProxy,
        renderState: fullWidthState,
        eFullWidthAnchor,
        showFullWidthFrameworkJsx,
        showEmbeddedFrameworkSection,
    } = useFullWidthRenderers(rowCtrl, context, gos, eGui, ePinnedLeftCells, eScrollingCells, ePinnedRightCells);

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
    const cellCtrlsUses = agUseSyncExternalStore(sub, () => {
        return cellCtrlsRef.current;
    }, []);

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
            getPinnedLeftSectionElement: () => ePinnedLeftSection.current ?? undefined,
            getScrollingRowElement: () => eScrollingCells.current ?? undefined,
            getPinnedRightRowElement: () => ePinnedRightCells.current ?? undefined,
            getPinnedRightSectionElement: () => ePinnedRightSection.current ?? undefined,
            ...fullWidthProxy,
        };
        rowCtrl.setComp(compProxy, eRef, containerType, compBean.current);
    }, []);

    const { showEmbeddedFullWidth, showFullWidthFramework, fullWidthCompDetails, embeddedSectionHasContent } =
        fullWidthState;

    const showCells = !isFullWidth && cellCtrlsMerged != null;

    const rowStyles = useMemo(() => {
        const res = { top, transform };

        Object.assign(res, userStyles);
        return res;
    }, [top, transform, userStyles]);

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

    const { leftWidth, centerWidth, rightWidth } = useMemo(
        () => rowCtrl.getMappedPinnedCellGroupWidths(),
        [rowCtrl, showEmbeddedFullWidth, embeddedSectionHasContent]
    );

    const showCellsJsx = (cellCtrls: CellCtrl[]) =>
        cellCtrls.map((cellCtrl) => (
            <CellComp
                cellCtrl={cellCtrl}
                editingCell={editSvc?.isEditing(cellCtrl, { withOpenEditor: true }) ?? false}
                printLayout={rowCtrl.printLayout}
                key={cellCtrl.instanceId}
            />
        ));

    const renderCellSection = (
        sectionClass: string,
        sectionRef: React.Ref<HTMLDivElement> | undefined,
        wrapperRef: React.Ref<HTMLDivElement>,
        width: number,
        children: React.ReactNode,
        pinned: boolean = false
    ) => (
        <div
            className={sectionClass}
            role="presentation"
            ref={sectionRef}
            style={pinned ? { width: `${width}px`, display: width > 0 ? undefined : 'none' } : undefined}
        >
            <div
                className="ag-grid-container-wrapper"
                role="presentation"
                ref={wrapperRef}
                style={{ width: width || undefined, display: width > 0 ? undefined : 'none' }}
            >
                {children}
            </div>
        </div>
    );

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
                    {renderCellSection(
                        'ag-grid-pinned-left-cells',
                        ePinnedLeftSection,
                        ePinnedLeftCells,
                        leftWidth,
                        showCellsJsx(leftCellCtrls),
                        true
                    )}
                    {renderCellSection(
                        'ag-grid-scrolling-cells',
                        undefined,
                        eScrollingCells,
                        centerWidth,
                        showCellsJsx(centerCellCtrls)
                    )}
                    {renderCellSection(
                        'ag-grid-pinned-right-cells',
                        ePinnedRightSection,
                        ePinnedRightCells,
                        rightWidth,
                        showCellsJsx(rightCellCtrls),
                        true
                    )}
                </>
            ) : showEmbeddedFullWidth ? (
                <>
                    {renderCellSection(
                        'ag-grid-pinned-left-cells',
                        ePinnedLeftSection,
                        ePinnedLeftCells,
                        leftWidth,
                        showEmbeddedFrameworkSection('left'),
                        true
                    )}
                    {renderCellSection(
                        'ag-grid-scrolling-cells',
                        undefined,
                        eScrollingCells,
                        centerWidth,
                        showEmbeddedFrameworkSection('center')
                    )}
                    {renderCellSection(
                        'ag-grid-pinned-right-cells',
                        ePinnedRightSection,
                        ePinnedRightCells,
                        rightWidth,
                        showEmbeddedFrameworkSection('right'),
                        true
                    )}
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
