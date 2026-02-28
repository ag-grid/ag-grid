import React, { memo, useCallback, useContext, useMemo, useRef, useState } from 'react';

import type {
    AbstractHeaderCellCtrl,
    HeaderCellCtrl,
    HeaderFilterCellCtrl,
    HeaderGroupCellCtrl,
    HeaderRowCtrl,
    IHeaderRowComp,
} from 'ag-grid-community';
import { _EmptyBean } from 'ag-grid-community';

import { BeansContext } from '../beansContext';
import { agFlushSync, getNextValueIfDifferent } from '../utils';
import HeaderCellComp from './headerCellComp';
import HeaderFilterCellComp from './headerFilterCellComp';
import HeaderGroupCellComp from './headerGroupCellComp';

const HeaderRowComp = ({ ctrl }: { ctrl: HeaderRowCtrl }) => {
    const { gos, context, visibleCols } = useContext(BeansContext);

    const { topOffset, rowHeight } = useMemo(() => ctrl.getTopAndHeight(), []);
    const tabIndex = useMemo(() => gos.get('tabIndex'), []);
    const [ariaRowIndex, setAriaRowIndex] = useState(() => ctrl.getAriaRowIndex());
    const className = ctrl.headerRowClass;

    const [height, setHeight] = useState<string>(() => rowHeight + 'px');
    const [top, setTop] = useState<string>(() => topOffset + 'px');
    const [pinnedWidthsVersion, setPinnedWidthsVersion] = useState(0);

    const cellCtrlsRef = useRef<AbstractHeaderCellCtrl[] | null>(null);
    const [cellCtrls, setCellCtrls] = useState<AbstractHeaderCellCtrl[]>(() => ctrl.getUpdatedHeaderCtrls());

    const compBean = useRef<_EmptyBean>();
    const eGui = useRef<HTMLDivElement | null>(null);

    const setRef = useCallback((eRef: HTMLDivElement | null) => {
        eGui.current = eRef;
        if (!eRef || !ctrl.isAlive() || context.isDestroyed()) {
            compBean.current = context.destroyBean(compBean.current);
            return;
        }
        compBean.current = context.createBean(new _EmptyBean());

        const compProxy: IHeaderRowComp = {
            setHeight: (height: string) => setHeight(height),
            setTop: (top: string) => setTop(top),
            setHeaderCtrls: (ctrls: AbstractHeaderCellCtrl[], forceOrder: boolean, afterScroll: boolean) => {
                const prevCellCtrls = cellCtrlsRef.current;
                const nextCells = getNextValueIfDifferent(prevCellCtrls, ctrls, forceOrder)!;
                if (nextCells !== prevCellCtrls) {
                    cellCtrlsRef.current = nextCells;
                    agFlushSync(afterScroll, () => setCellCtrls(nextCells));
                }
            },
            refreshPinnedCellGroupWidths: () => setPinnedWidthsVersion((v) => v + 1),
            setWidth: (width: string) => {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
            setRowIndex: (rowIndex: number) => {
                setAriaRowIndex(rowIndex);
            },
        };

        ctrl.setComp(compProxy, compBean.current, false);
    }, []);

    const style = useMemo(
        () => ({
            height: height,
            top: top,
        }),
        [height, top]
    );

    const isPrintLayout = gos.get('domLayout') === 'print';

    const { leftCellCtrls, centerCellCtrls, rightCellCtrls, leftWidth, rightWidth } = useMemo(() => {
        const left: AbstractHeaderCellCtrl[] = [];
        const center: AbstractHeaderCellCtrl[] = [];
        const right: AbstractHeaderCellCtrl[] = [];

        for (const cellCtrl of cellCtrls) {
            if (isPrintLayout) {
                center.push(cellCtrl);
                continue;
            }
            const pinned = cellCtrl.column.getPinned();
            if (pinned === 'left') {
                left.push(cellCtrl);
            } else if (pinned === 'right') {
                right.push(cellCtrl);
            } else {
                center.push(cellCtrl);
            }
        }

        const leftWidth = isPrintLayout ? 0 : visibleCols.getLeftStickyColumnContainerWidth();
        const rightWidth = isPrintLayout ? 0 : visibleCols.getRightStickyColumnContainerWidth();

        return {
            leftCellCtrls: left,
            centerCellCtrls: center,
            rightCellCtrls: right,
            leftWidth,
            rightWidth,
        };
    }, [cellCtrls, isPrintLayout, pinnedWidthsVersion, visibleCols]);

    const createCellJsx = useCallback((cellCtrl: AbstractHeaderCellCtrl) => {
        switch (ctrl.type) {
            case 'group':
                return <HeaderGroupCellComp ctrl={cellCtrl as HeaderGroupCellCtrl} key={cellCtrl.instanceId} />;

            case 'filter':
                return <HeaderFilterCellComp ctrl={cellCtrl as HeaderFilterCellCtrl} key={cellCtrl.instanceId} />;

            default:
                return <HeaderCellComp ctrl={cellCtrl as HeaderCellCtrl} key={cellCtrl.instanceId} />;
        }
    }, []);

    return (
        <div
            ref={setRef}
            className={className}
            role="row"
            style={style}
            tabIndex={tabIndex}
            aria-rowindex={ariaRowIndex}
        >
            <div
                className="ag-grid-pinned-left-cells"
                role="presentation"
                style={{ width: leftWidth || undefined, display: leftWidth > 0 ? undefined : 'none' }}
            >
                {leftCellCtrls.map(createCellJsx)}
            </div>
            <div className="ag-grid-scrolling-cells" role="presentation">
                {centerCellCtrls.map(createCellJsx)}
            </div>
            <div
                className="ag-grid-pinned-right-cells"
                role="presentation"
                style={{ width: rightWidth || undefined, display: rightWidth > 0 ? undefined : 'none' }}
            >
                {rightCellCtrls.map(createCellJsx)}
            </div>
        </div>
    );
};

export default memo(HeaderRowComp);
