import type {
    AbstractHeaderCellCtrl,
    HeaderCellCtrl,
    HeaderFilterCellCtrl,
    HeaderGroupCellCtrl,
    HeaderRowCtrl,
    IHeaderRowComp,
} from '@ag-grid-community/core';
import { HeaderRowType } from '@ag-grid-community/core';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';

import { agFlushSync, getNextValueIfDifferent } from '../utils';
import HeaderCellComp from './headerCellComp';
import HeaderFilterCellComp from './headerFilterCellComp';
import HeaderGroupCellComp from './headerGroupCellComp';

const HeaderRowComp = ({ ctrl }: { ctrl: HeaderRowCtrl }) => {
    const { topOffset, rowHeight } = useMemo(() => ctrl.getTopAndHeight(), []);
    const ariaRowIndex = ctrl.getAriaRowIndex();
    const className = ctrl.getHeaderRowClass();

    const [height, setHeight] = useState<string>(() => rowHeight + 'px');
    const [top, setTop] = useState<string>(() => topOffset + 'px');

    const cellCtrlsRef = useRef<AbstractHeaderCellCtrl[] | null>(null);
    const prevCellCtrlsRef = useRef<AbstractHeaderCellCtrl[] | null>(null);
    const [cellCtrls, setCellCtrls] = useState<AbstractHeaderCellCtrl[]>(() => ctrl.getHeaderCtrls());

    const eGui = useRef<HTMLDivElement | null>(null);

    const setRef = useCallback((e: HTMLDivElement) => {
        eGui.current = e;
        if (!e) {
            return;
        }

        const compProxy: IHeaderRowComp = {
            setHeight: (height: string) => setHeight(height),
            setTop: (top: string) => setTop(top),
            setHeaderCtrls: (ctrls: AbstractHeaderCellCtrl[], forceOrder: boolean, afterScroll: boolean) => {
                prevCellCtrlsRef.current = cellCtrlsRef.current;
                cellCtrlsRef.current = ctrls;

                const next = getNextValueIfDifferent(prevCellCtrlsRef.current, ctrls, forceOrder)!;
                if (next !== prevCellCtrlsRef.current) {
                    agFlushSync(afterScroll, () => setCellCtrls(next));
                }
            },
            setWidth: (width: string) => {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
        };

        ctrl.setComp(compProxy, false);
    }, []);

    const style = useMemo(
        () => ({
            height: height,
            top: top,
        }),
        [height, top]
    );

    const createCellJsx = useCallback((cellCtrl: AbstractHeaderCellCtrl) => {
        switch (ctrl.getType()) {
            case HeaderRowType.COLUMN_GROUP:
                return <HeaderGroupCellComp ctrl={cellCtrl as HeaderGroupCellCtrl} key={cellCtrl.instanceId} />;

            case HeaderRowType.FLOATING_FILTER:
                return <HeaderFilterCellComp ctrl={cellCtrl as HeaderFilterCellCtrl} key={cellCtrl.instanceId} />;

            default:
                return <HeaderCellComp ctrl={cellCtrl as HeaderCellCtrl} key={cellCtrl.instanceId} />;
        }
    }, []);

    return (
        <div ref={setRef} className={className} role="row" style={style} aria-rowindex={ariaRowIndex}>
            {cellCtrls.map(createCellJsx)}
        </div>
    );
};

export default memo(HeaderRowComp);
