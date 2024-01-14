// @ag-grid-community/react v31.0.0
import { HeaderRowType } from '@ag-grid-community/core';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import HeaderCellComp from './headerCellComp.mjs';
import HeaderGroupCellComp from './headerGroupCellComp.mjs';
import HeaderFilterCellComp from './headerFilterCellComp.mjs';
import { agFlushSync, getNextValueIfDifferent } from '../utils.mjs';
const HeaderRowComp = (props) => {
    const { ctrl } = props;
    const { topOffset, rowHeight } = useMemo(() => ctrl.getTopAndHeight(), []);
    const ariaRowIndex = ctrl.getAriaRowIndex();
    const className = ctrl.getHeaderRowClass();
    const transform = useMemo(() => ctrl.getTransform(), []);
    const [height, setHeight] = useState(() => rowHeight + 'px');
    const [top, setTop] = useState(() => topOffset + 'px');
    const [cellCtrls, setCellCtrls] = useState(() => ctrl.getHeaderCtrls());
    const eGui = useRef(null);
    const setRef = useCallback((e) => {
        eGui.current = e;
        if (!e) {
            return;
        }
        const compProxy = {
            setHeight: height => setHeight(height),
            setTop: top => setTop(top),
            setHeaderCtrls: (ctrls, forceOrder, afterScroll) => {
                agFlushSync(afterScroll, () => {
                    setCellCtrls(prev => getNextValueIfDifferent(prev, ctrls, forceOrder));
                });
            },
            setWidth: width => {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
        };
        ctrl.setComp(compProxy, false);
    }, []);
    const style = useMemo(() => ({
        transform: transform,
        height: height,
        top: top,
    }), [transform, height, top]);
    const createCellJsx = useCallback((cellCtrl) => {
        switch (ctrl.getType()) {
            case HeaderRowType.COLUMN_GROUP:
                return React.createElement(HeaderGroupCellComp, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
            case HeaderRowType.FLOATING_FILTER:
                return React.createElement(HeaderFilterCellComp, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
            default:
                return React.createElement(HeaderCellComp, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
        }
    }, []);
    return (React.createElement("div", { ref: setRef, className: className, role: "row", style: style, "aria-rowindex": ariaRowIndex }, cellCtrls.map(createCellJsx)));
};
export default memo(HeaderRowComp);
