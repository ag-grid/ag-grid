// @ag-grid-community/react v30.1.0
import React, { memo, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext.mjs';
import { HeaderRowContainerCtrl } from '@ag-grid-community/core';
import { CssClasses } from '../utils.mjs';
import HeaderRowComp from './headerRowComp.mjs';
const HeaderRowContainerComp = (props) => {
    const [cssClasses, setCssClasses] = useState(() => new CssClasses());
    const [ariaHidden, setAriaHidden] = useState(false);
    const [headerRowCtrls, setHeaderRowCtrls] = useState([]);
    const { context } = useContext(BeansContext);
    const eGui = useRef(null);
    const eCenterContainer = useRef(null);
    const headerRowCtrlRef = useRef(null);
    const pinnedLeft = props.pinned === 'left';
    const pinnedRight = props.pinned === 'right';
    const centre = !pinnedLeft && !pinnedRight;
    const setRef = useCallback((e) => {
        eGui.current = e;
        if (!eGui.current) {
            context.destroyBean(headerRowCtrlRef.current);
            headerRowCtrlRef.current = null;
            return;
        }
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
        headerRowCtrlRef.current = context.createBean(new HeaderRowContainerCtrl(props.pinned));
        headerRowCtrlRef.current.setComp(compProxy, eGui.current);
    }, []);
    const className = useMemo(() => cssClasses.toString(), [cssClasses]);
    const insertRowsJsx = () => headerRowCtrls.map(ctrl => React.createElement(HeaderRowComp, { ctrl: ctrl, key: ctrl.getInstanceId() }));
    return (React.createElement(React.Fragment, null,
        pinnedLeft &&
            React.createElement("div", { ref: setRef, className: "ag-pinned-left-header " + className, "aria-hidden": ariaHidden, role: "presentation" }, insertRowsJsx()),
        pinnedRight &&
            React.createElement("div", { ref: setRef, className: "ag-pinned-right-header " + className, "aria-hidden": ariaHidden, role: "presentation" }, insertRowsJsx()),
        centre &&
            React.createElement("div", { ref: setRef, className: "ag-header-viewport " + className, role: "presentation" },
                React.createElement("div", { ref: eCenterContainer, className: "ag-header-container", role: "rowgroup" }, insertRowsJsx()))));
};
export default memo(HeaderRowContainerComp);
