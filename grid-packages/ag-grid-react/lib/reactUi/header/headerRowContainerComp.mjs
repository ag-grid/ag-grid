// ag-grid-react v30.0.4
import React, { memo, useContext, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext.mjs';
import { HeaderRowContainerCtrl } from 'ag-grid-community';
import { CssClasses } from '../utils.mjs';
import HeaderRowComp from './headerRowComp.mjs';
import { useLayoutEffectOnce } from '../useEffectOnce.mjs';
const HeaderRowContainerComp = (props) => {
    const [cssClasses, setCssClasses] = useState(new CssClasses());
    const [ariaHidden, setAriaHidden] = useState(false);
    const [headerRowCtrls, setHeaderRowCtrls] = useState([]);
    const { context } = useContext(BeansContext);
    const eGui = useRef(null);
    const eCenterContainer = useRef(null);
    const pinnedLeft = props.pinned === 'left';
    const pinnedRight = props.pinned === 'right';
    const centre = !pinnedLeft && !pinnedRight;
    useLayoutEffectOnce(() => {
        const compProxy = {
            setDisplayed: displayed => {
                setCssClasses(prev => prev.setClass('ag-hidden', !displayed));
                setAriaHidden(!displayed);
            },
            setCtrls: ctrls => setHeaderRowCtrls(ctrls),
            // centre only
            setCenterWidth: width => {
                if (eCenterContainer.current) {
                    eCenterContainer.current.style.width = width;
                }
            },
            setViewportScrollLeft: left => {
                if (eGui.current) {
                    eGui.current.scrollLeft = left;
                }
            },
            // pinned only
            setPinnedContainerWidth: width => {
                if (eGui.current) {
                    eGui.current.style.width = width;
                    eGui.current.style.minWidth = width;
                    eGui.current.style.maxWidth = width;
                }
            }
        };
        const ctrl = context.createBean(new HeaderRowContainerCtrl(props.pinned));
        ctrl.setComp(compProxy, eGui.current);
        return () => {
            context.destroyBean(ctrl);
        };
    });
    const className = useMemo(() => cssClasses.toString(), [cssClasses]);
    const insertRowsJsx = () => headerRowCtrls.map(ctrl => React.createElement(HeaderRowComp, { ctrl: ctrl, key: ctrl.getInstanceId() }));
    return (React.createElement(React.Fragment, null,
        pinnedLeft &&
            React.createElement("div", { ref: eGui, className: "ag-pinned-left-header " + className, "aria-hidden": ariaHidden, role: "presentation" }, insertRowsJsx()),
        pinnedRight &&
            React.createElement("div", { ref: eGui, className: "ag-pinned-right-header " + className, "aria-hidden": ariaHidden, role: "presentation" }, insertRowsJsx()),
        centre &&
            React.createElement("div", { ref: eGui, className: "ag-header-viewport " + className, role: "presentation" },
                React.createElement("div", { ref: eCenterContainer, className: "ag-header-container", role: "rowgroup" }, insertRowsJsx()))));
};
export default memo(HeaderRowContainerComp);
