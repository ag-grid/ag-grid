// ag-grid-react v30.0.4
import React, { memo, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext.mjs';
import { showJsComp } from '../jsComp.mjs';
import { useLayoutEffectOnce } from '../useEffectOnce.mjs';
import { CssClasses } from '../utils.mjs';
const HeaderGroupCellComp = (props) => {
    const { context } = useContext(BeansContext);
    const [cssClasses, setCssClasses] = useState(new CssClasses());
    const [cssResizableClasses, setResizableCssClasses] = useState(new CssClasses());
    const [resizableAriaHidden, setResizableAriaHidden] = useState("false");
    const [title, setTitle] = useState();
    const [colId, setColId] = useState();
    const [ariaExpanded, setAriaExpanded] = useState();
    const [userCompDetails, setUserCompDetails] = useState();
    const eGui = useRef(null);
    const eResize = useRef(null);
    const { ctrl } = props;
    useLayoutEffectOnce(() => {
        const compProxy = {
            setWidth: width => {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            setColId: id => setColId(id),
            setTitle: title => setTitle(title),
            setUserCompDetails: compDetails => setUserCompDetails(compDetails),
            setResizableDisplayed: (displayed) => {
                setResizableCssClasses(prev => prev.setClass('ag-hidden', !displayed));
                setResizableAriaHidden(!displayed ? "true" : "false");
            },
            setAriaExpanded: expanded => setAriaExpanded(expanded)
        };
        ctrl.setComp(compProxy, eGui.current, eResize.current);
    });
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
    return (React.createElement("div", { ref: eGui, className: className, title: title, "col-id": colId, role: "columnheader", tabIndex: -1, "aria-expanded": ariaExpanded },
        reactUserComp && React.createElement(UserCompClass, Object.assign({}, userCompDetails.params)),
        React.createElement("div", { ref: eResize, "aria-hidden": resizableAriaHidden, className: resizableClassName })));
};
export default memo(HeaderGroupCellComp);
