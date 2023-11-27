// @ag-grid-community/react v31.0.0
import React, { memo, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext.mjs';
import { showJsComp } from '../jsComp.mjs';
import { CssClasses } from '../utils.mjs';
const HeaderGroupCellComp = (props) => {
    const { context } = useContext(BeansContext);
    const { ctrl } = props;
    const [cssClasses, setCssClasses] = useState(() => new CssClasses());
    const [cssResizableClasses, setResizableCssClasses] = useState(() => new CssClasses());
    const [resizableAriaHidden, setResizableAriaHidden] = useState("false");
    const [ariaExpanded, setAriaExpanded] = useState();
    const [userCompDetails, setUserCompDetails] = useState();
    const colId = useMemo(() => ctrl.getColId(), []);
    const eGui = useRef(null);
    const eResize = useRef(null);
    const userCompRef = useRef();
    const setRef = useCallback((e) => {
        eGui.current = e;
        if (!eGui.current) {
            return;
        }
        const compProxy = {
            setWidth: width => {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            setUserCompDetails: compDetails => setUserCompDetails(compDetails),
            setResizableDisplayed: (displayed) => {
                setResizableCssClasses(prev => prev.setClass('ag-hidden', !displayed));
                setResizableAriaHidden(!displayed ? "true" : "false");
            },
            setAriaExpanded: expanded => setAriaExpanded(expanded),
            getUserCompInstance: () => userCompRef.current || undefined,
        };
        ctrl.setComp(compProxy, eGui.current, eResize.current);
    }, []);
    // js comps
    useLayoutEffect(() => showJsComp(userCompDetails, context, eGui.current), [userCompDetails]);
    // add drag handling, must be done after component is added to the dom
    useEffect(() => {
        if (eGui.current) {
            ctrl.setDragSource(eGui.current);
        }
    }, [userCompDetails]);
    const className = useMemo(() => 'ag-header-group-cell ' + cssClasses.toString(), [cssClasses]);
    const resizableClassName = useMemo(() => 'ag-header-cell-resize ' + cssResizableClasses.toString(), [cssResizableClasses]);
    const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    const UserCompClass = userCompDetails && userCompDetails.componentClass;
    return (React.createElement("div", { ref: setRef, className: className, "col-id": colId, role: "columnheader", tabIndex: -1, "aria-expanded": ariaExpanded },
        reactUserComp && React.createElement(UserCompClass, Object.assign({}, userCompDetails.params, { ref: userCompRef })),
        React.createElement("div", { ref: eResize, "aria-hidden": resizableAriaHidden, className: resizableClassName })));
};
export default memo(HeaderGroupCellComp);
