// @ag-grid-community/react v31.0.0
import React, { memo, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext.mjs';
import { GridHeaderCtrl, } from '@ag-grid-community/core';
import { CssClasses } from '../utils.mjs';
import HeaderRowContainerComp from './headerRowContainerComp.mjs';
const GridHeaderComp = () => {
    const [cssClasses, setCssClasses] = useState(() => new CssClasses());
    const [height, setHeight] = useState();
    const { context } = useContext(BeansContext);
    const eGui = useRef(null);
    const gridCtrlRef = useRef(null);
    const setRef = useCallback((e) => {
        eGui.current = e;
        if (!e) {
            context.destroyBean(gridCtrlRef.current);
            gridCtrlRef.current = null;
            return;
        }
        const compProxy = {
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            setHeightAndMinHeight: height => setHeight(height)
        };
        gridCtrlRef.current = context.createBean(new GridHeaderCtrl());
        gridCtrlRef.current.setComp(compProxy, eGui.current, eGui.current);
    }, []);
    const className = useMemo(() => {
        let res = cssClasses.toString();
        return 'ag-header ' + res;
    }, [cssClasses]);
    const style = useMemo(() => ({
        height: height,
        minHeight: height
    }), [height]);
    return (React.createElement("div", { ref: setRef, className: className, style: style, role: "presentation" },
        React.createElement(HeaderRowContainerComp, { pinned: 'left' }),
        React.createElement(HeaderRowContainerComp, { pinned: null }),
        React.createElement(HeaderRowContainerComp, { pinned: 'right' })));
};
export default memo(GridHeaderComp);
