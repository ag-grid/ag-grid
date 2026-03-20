import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import type {
    AbstractHeaderCellCtrl,
    HeaderCellCtrl,
    HeaderFilterCellCtrl,
    HeaderGroupCellCtrl,
    HeaderRowCtrl,
    IHeaderRowComp,
} from 'ag-grid-community';
import { _EmptyBean, _setAriaRowIndex } from 'ag-grid-community';

import { BeansContext } from '../beansContext';
import { agFlushSync, getNextValueIfDifferent } from '../utils';
import HeaderCellComp from './headerCellComp';
import HeaderFilterCellComp from './headerFilterCellComp';
import HeaderGroupCellComp from './headerGroupCellComp';

const HeaderRowComp = ({
    ctrl,
    setGuiRef,
}: {
    ctrl: HeaderRowCtrl;
    setGuiRef?: (eGui: HTMLDivElement | null) => void;
}) => {
    const { context, visibleCols, gos } = useContext(BeansContext);

    const eGui = useRef<HTMLDivElement | null>(null);
    const compBean = useRef<_EmptyBean>();

    const [height, setHeight] = useState<string>('0px');
    const [top, setTop] = useState<string>('0px');
    const [width, setWidth] = useState<string>('');
    const [ariaRowIndex, setAriaRowIndex] = useState<number>(ctrl.getAriaRowIndex());

    // Cell ctrls partitioned into 3 sections
    const cellCtrlsRef = useRef<AbstractHeaderCellCtrl[]>([]);
    const prevCellCtrlsRef = useRef<AbstractHeaderCellCtrl[]>([]);
    const domOrderRef = useRef<boolean>(false);
    const [cellCtrls, setCellCtrls] = useState<AbstractHeaderCellCtrl[]>([]);

    // Pinned section widths
    const [pinnedLeftWidth, setPinnedLeftWidth] = useState<number>(0);
    const [centerWidth, setCenterWidth] = useState<number>(0);
    const [pinnedRightWidth, setPinnedRightWidth] = useState<number>(0);

    const refreshPinnedWidths = useCallback(() => {
        const isPrint = gos.get('domLayout') === 'print';
        if (isPrint) {
            setPinnedLeftWidth(0);
            setCenterWidth(visibleCols.bodyWidth);
            setPinnedRightWidth(0);
            return;
        }
        setPinnedLeftWidth(visibleCols.getLeftStickyColumnContainerWidth());
        setCenterWidth(visibleCols.bodyWidth);
        setPinnedRightWidth(visibleCols.getRightStickyColumnContainerWidth());
    }, [gos, visibleCols]);

    const setRef = useCallback((eRef: HTMLDivElement | null) => {
        eGui.current = eRef;
        setGuiRef?.(eRef);
        if (!eRef || !ctrl.isAlive() || context.isDestroyed()) {
            compBean.current = context.destroyBean(compBean.current);
            return;
        }

        compBean.current = context.createBean(new _EmptyBean());

        const updateCellCtrls = (useFlushSync: boolean) => {
            const next = getNextValueIfDifferent(prevCellCtrlsRef.current, cellCtrlsRef.current, domOrderRef.current)!;
            if (next !== prevCellCtrlsRef.current) {
                prevCellCtrlsRef.current = next;
                agFlushSync(useFlushSync, () => setCellCtrls(next));
            }
        };

        const compProxy: IHeaderRowComp = {
            setTop: (value) => setTop(value),
            setHeight: (value) => setHeight(value),
            setHeaderCtrls: (ctrls, forceOrder, afterScroll) => {
                domOrderRef.current = forceOrder;
                cellCtrlsRef.current = ctrls;
                updateCellCtrls(afterScroll);
            },
            refreshPinnedCellGroupWidths: () => refreshPinnedWidths(),
            setWidth: (value) => setWidth(value),
            setRowIndex: (rowIndex) => setAriaRowIndex(rowIndex),
        };

        ctrl.setComp(compProxy, compBean.current);
    }, [context, ctrl, refreshPinnedWidths, setGuiRef]);

    // Set aria-row-index on the DOM element directly
    useEffect(() => {
        if (eGui.current) {
            _setAriaRowIndex(eGui.current, ariaRowIndex);
            eGui.current.classList.toggle('ag-header-row-not-first', ariaRowIndex !== 1);
        }
    }, [ariaRowIndex]);

    // Partition cells into left/center/right sections
    const isPrint = gos.get('domLayout') === 'print';
    const { leftCells, centerCells, rightCells } = useMemo(() => {
        if (isPrint) {
            // In print layout, all cells go to center
            return {
                leftCells: [] as AbstractHeaderCellCtrl[],
                centerCells: cellCtrls,
                rightCells: [] as AbstractHeaderCellCtrl[],
            };
        }

        const left: AbstractHeaderCellCtrl[] = [];
        const center: AbstractHeaderCellCtrl[] = [];
        const right: AbstractHeaderCellCtrl[] = [];

        for (const ctrl of cellCtrls) {
            const pinned = ctrl.column.getPinned();
            if (pinned === 'left') {
                left.push(ctrl);
            } else if (pinned === 'right') {
                right.push(ctrl);
            } else {
                center.push(ctrl);
            }
        }

        return { leftCells: left, centerCells: center, rightCells: right };
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

    const style = useMemo(
        () => ({
            height,
            top,
            width,
        }),
        [height, top, width]
    );

    const leftStyle: React.CSSProperties = useMemo(
        () => ({
            width: `${pinnedLeftWidth}px`,
            display: pinnedLeftWidth > 0 || isPrint ? '' : 'none',
        }),
        [pinnedLeftWidth, isPrint]
    );

    const centerStyle: React.CSSProperties = useMemo(
        () => ({
            width: `${centerWidth}px`,
        }),
        [centerWidth]
    );

    const rightStyle: React.CSSProperties = useMemo(
        () => ({
            width: `${pinnedRightWidth}px`,
            display: pinnedRightWidth > 0 || isPrint ? '' : 'none',
        }),
        [pinnedRightWidth, isPrint]
    );

    const tabIndex = gos.get('tabIndex');

    return (
        <div ref={setRef} className={ctrl.headerRowClass} role="row" style={style} tabIndex={tabIndex}>
            <div className="ag-grid-pinned-left-cells" role="presentation" style={leftStyle}>
                {leftCells.map(createCellJsx)}
            </div>
            <div className="ag-grid-scrolling-cells" role="presentation" style={centerStyle}>
                {centerCells.map(createCellJsx)}
            </div>
            <div className="ag-grid-pinned-right-cells" role="presentation" style={rightStyle}>
                {rightCells.map(createCellJsx)}
            </div>
        </div>
    );
};

export default memo(HeaderRowComp);
