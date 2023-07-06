// ag-grid-react v30.0.4
import { HeaderRowType, _ } from 'ag-grid-community';
import React, { memo, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext.mjs';
import HeaderCellComp from './headerCellComp.mjs';
import HeaderGroupCellComp from './headerGroupCellComp.mjs';
import HeaderFilterCellComp from './headerFilterCellComp.mjs';
import { useLayoutEffectOnce } from '../useEffectOnce.mjs';
const HeaderRowComp = (props) => {
    const { gridOptionsService } = useContext(BeansContext);
    const [transform, setTransform] = useState();
    const [height, setHeight] = useState();
    const [top, setTop] = useState();
    const [ariaRowIndex, setAriaRowIndex] = useState();
    const [cellCtrls, setCellCtrls] = useState([]);
    const eGui = useRef(null);
    const { ctrl } = props;
    const typeColumn = ctrl.getType() === HeaderRowType.COLUMN;
    const typeGroup = ctrl.getType() === HeaderRowType.COLUMN_GROUP;
    const typeFilter = ctrl.getType() === HeaderRowType.FLOATING_FILTER;
    const setCellCtrlsMaintainOrder = useCallback((prev, next) => {
        const isEnsureDomOrder = gridOptionsService.is('ensureDomOrder');
        const isPrintLayout = gridOptionsService.isDomLayout('print');
        // if we are ensuring dom order, we set the ctrls into the dom in the same order they appear on screen
        if (isEnsureDomOrder || isPrintLayout) {
            return next;
        }
        // if not maintaining order, we want to keep the dom elements we have and add new ones to the end,
        // otherwise we will loose transition effects as elements are placed in different dom locations
        const prevMap = _.mapById(prev, c => c.getInstanceId());
        const nextMap = _.mapById(next, c => c.getInstanceId());
        const oldCtrlsWeAreKeeping = prev.filter(c => nextMap.has(c.getInstanceId()));
        const newCtrls = next.filter(c => !prevMap.has(c.getInstanceId()));
        return [...oldCtrlsWeAreKeeping, ...newCtrls];
    }, []);
    useLayoutEffectOnce(() => {
        const compProxy = {
            setTransform: transform => setTransform(transform),
            setHeight: height => setHeight(height),
            setTop: top => setTop(top),
            setHeaderCtrls: ctrls => setCellCtrls(prev => setCellCtrlsMaintainOrder(prev, ctrls)),
            setWidth: width => {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
            setAriaRowIndex: rowIndex => setAriaRowIndex(rowIndex)
        };
        ctrl.setComp(compProxy);
    });
    const style = useMemo(() => ({
        transform: transform,
        height: height,
        top: top,
    }), [transform, height, top]);
    const className = useMemo(() => {
        const res = [`ag-header-row`];
        typeColumn && res.push(`ag-header-row-column`);
        typeGroup && res.push(`ag-header-row-column-group`);
        typeFilter && res.push(`ag-header-row-column-filter`);
        return res.join(' ');
    }, []);
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
    return (React.createElement("div", { ref: eGui, className: className, role: "row", style: style, "aria-rowindex": ariaRowIndex }, cellCtrls.map(createCellJsx)));
};
export default memo(HeaderRowComp);
