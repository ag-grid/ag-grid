// ag-grid-react v30.0.2
import React, { memo, useContext, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext';
import { GridHeaderCtrl, } from 'ag-grid-community';
import { CssClasses } from '../utils';
import HeaderRowContainerComp from './headerRowContainerComp';
import { useLayoutEffectOnce } from '../useEffectOnce';
const GridHeaderComp = () => {
    const [cssClasses, setCssClasses] = useState(new CssClasses());
    const [height, setHeight] = useState();
    const { context } = useContext(BeansContext);
    const eGui = useRef(null);
    useLayoutEffectOnce(() => {
        const compProxy = {
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            setHeightAndMinHeight: height => setHeight(height)
        };
        const ctrl = context.createBean(new GridHeaderCtrl());
        ctrl.setComp(compProxy, eGui.current, eGui.current);
        return () => {
            context.destroyBean(ctrl);
        };
    });
    const className = useMemo(() => {
        let res = cssClasses.toString();
        return 'ag-header ' + res;
    }, [cssClasses]);
    const style = useMemo(() => ({
        height: height,
        minHeight: height
    }), [height]);
    return (React.createElement("div", { ref: eGui, className: className, style: style, role: "presentation" },
        React.createElement(HeaderRowContainerComp, { pinned: 'left' }),
        React.createElement(HeaderRowContainerComp, { pinned: null }),
        React.createElement(HeaderRowContainerComp, { pinned: 'right' })));
};
export default memo(GridHeaderComp);
