import { _setAriaRowIndex } from 'ag-stack';
import React, { memo, useCallback, useContext, useMemo, useRef, useState } from 'react';

import type {
    AbstractHeaderCellCtrl,
    HeaderCellCtrl,
    HeaderFilterCellCtrl,
    HeaderGroupCellCtrl,
    HeaderRowCtrl,
    IHeaderRowComp,
    PinnedSectionWidthsCache,
} from 'ag-grid-community';
import {
    _EmptyBean,
    _isHeaderFocusSuppressed,
    _partitionByPinned,
    _updatePinnedSectionWidths,
} from 'ag-grid-community';

import { BeansContext } from '../beansContext';
import { agFlushSync, getNextValueIfDifferent } from '../utils';
import HeaderCellComp from './headerCellComp';
import HeaderFilterCellComp from './headerFilterCellComp';
import HeaderGroupCellComp from './headerGroupCellComp';

function getCellSectionSignature(ctrls: AbstractHeaderCellCtrl[], isPrint: boolean): string {
    if (isPrint) {
        return 'print';
    }

    return ctrls
        .map((ctrl) => {
            const pinned = ctrl.column.getPinned() ?? 'center';
            return `${ctrl.instanceId}:${pinned}`;
        })
        .join('|');
}

const HeaderRowComp = ({
    ctrl,
    setGuiRef,
}: {
    ctrl: HeaderRowCtrl;
    setGuiRef?: (eGui: HTMLDivElement | null) => void;
}) => {
    const beans = useContext(BeansContext);
    const { context, visibleCols, gos } = beans;

    const eGui = useRef<HTMLDivElement | null>(null);
    const ePinnedLeft = useRef<HTMLDivElement | null>(null);
    const eScrolling = useRef<HTMLDivElement | null>(null);
    const ePinnedRight = useRef<HTMLDivElement | null>(null);
    const compBean = useRef<_EmptyBean>();

    // Cell ctrls partitioned into 3 sections
    const cellCtrlsRef = useRef<AbstractHeaderCellCtrl[]>([]);
    const prevCellCtrlsRef = useRef<AbstractHeaderCellCtrl[]>([]);
    const sectionSignatureRef = useRef<string>('');
    const domOrderRef = useRef<boolean>(false);
    const [cellCtrls, setCellCtrls] = useState<AbstractHeaderCellCtrl[]>([]);

    const pinnedWidthsCache = useRef<PinnedSectionWidthsCache>({
        pinnedLeftWidth: undefined,
        centerWidth: undefined,
        pinnedRightWidth: undefined,
    });

    const refreshPinnedWidths = useCallback(() => {
        if (!ePinnedLeft.current || !eScrolling.current || !ePinnedRight.current) {
            return;
        }
        const isPrint = gos.get('domLayout') === 'print';
        _updatePinnedSectionWidths(
            visibleCols,
            isPrint,
            { ePinnedLeft: ePinnedLeft.current, eScrolling: eScrolling.current, ePinnedRight: ePinnedRight.current },
            pinnedWidthsCache.current
        );
    }, [gos, visibleCols]);

    const setRef = useCallback(
        (eRef: HTMLDivElement | null) => {
            eGui.current = eRef;
            setGuiRef?.(eRef);
            if (!eRef || !ctrl.isAlive() || context.isDestroyed()) {
                compBean.current = context.destroyBean(compBean.current);
                return;
            }

            compBean.current = context.createBean(new _EmptyBean());

            const updateCellCtrls = (useFlushSync: boolean) => {
                const isPrint = gos.get('domLayout') === 'print';
                const nextSectionSignature = getCellSectionSignature(cellCtrlsRef.current, isPrint);
                const shouldRefreshForSectionChange = sectionSignatureRef.current !== nextSectionSignature;
                const next = shouldRefreshForSectionChange
                    ? cellCtrlsRef.current
                    : getNextValueIfDifferent(prevCellCtrlsRef.current, cellCtrlsRef.current, domOrderRef.current)!;

                if (next !== prevCellCtrlsRef.current) {
                    prevCellCtrlsRef.current = next;
                    sectionSignatureRef.current = nextSectionSignature;
                    agFlushSync(useFlushSync, () => setCellCtrls(next));
                }
            };

            const compProxy: IHeaderRowComp = {
                setTop: (value) => {
                    if (eGui.current) {
                        eGui.current.style.top = value;
                    }
                },
                setHeight: (value) => {
                    if (eGui.current) {
                        eGui.current.style.height = value;
                    }
                },
                setHeaderCtrls: (ctrls, forceOrder, afterScroll) => {
                    domOrderRef.current = forceOrder;
                    cellCtrlsRef.current = ctrls;
                    updateCellCtrls(afterScroll);
                },
                refreshPinnedCellGroupWidths: () => refreshPinnedWidths(),
                setWidth: (value) => {
                    if (eGui.current) {
                        eGui.current.style.width = value;
                    }
                },
                setRowIndex: (rowIndex) => {
                    if (eGui.current) {
                        _setAriaRowIndex(eGui.current, rowIndex);
                        eGui.current.classList.toggle('ag-header-row-not-first', rowIndex !== 1);
                    }
                },
            };

            ctrl.setComp(compProxy, compBean.current);
        },
        [context, ctrl, refreshPinnedWidths, setGuiRef]
    );

    const isPrint = gos.get('domLayout') === 'print';
    const {
        left: leftCells,
        center: centerCells,
        right: rightCells,
    } = useMemo(() => {
        if (isPrint) {
            return { left: [] as AbstractHeaderCellCtrl[], center: cellCtrls, right: [] as AbstractHeaderCellCtrl[] };
        }
        return _partitionByPinned(cellCtrls, (ctrl: AbstractHeaderCellCtrl) => ctrl.column.getPinned());
    }, [cellCtrls, isPrint]);

    const createCellJsx = useCallback(
        (cellCtrl: AbstractHeaderCellCtrl) => {
            switch (ctrl.type) {
                case 'group':
                    return <HeaderGroupCellComp ctrl={cellCtrl as HeaderGroupCellCtrl} key={cellCtrl.instanceId} />;
                case 'filter':
                    return <HeaderFilterCellComp ctrl={cellCtrl as HeaderFilterCellCtrl} key={cellCtrl.instanceId} />;
                default:
                    return <HeaderCellComp ctrl={cellCtrl as HeaderCellCtrl} key={cellCtrl.instanceId} />;
            }
        },
        [ctrl.type]
    );

    const tabIndex = _isHeaderFocusSuppressed(beans) ? undefined : gos.get('tabIndex');

    return (
        <div ref={setRef} className={ctrl.headerRowClass} role="row" tabIndex={tabIndex}>
            <div ref={ePinnedLeft} className="ag-grid-pinned-left-cells" role="presentation">
                <div className="ag-grid-container-wrapper" role="presentation">
                    {leftCells.map(createCellJsx)}
                </div>
            </div>
            <div ref={eScrolling} className="ag-grid-scrolling-cells" role="presentation">
                {centerCells.map(createCellJsx)}
            </div>
            <div ref={ePinnedRight} className="ag-grid-pinned-right-cells" role="presentation">
                <div className="ag-grid-container-wrapper" role="presentation">
                    {rightCells.map(createCellJsx)}
                </div>
            </div>
        </div>
    );
};

export default memo(HeaderRowComp);
