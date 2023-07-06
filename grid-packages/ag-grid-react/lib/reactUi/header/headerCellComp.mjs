// ag-grid-react v30.0.4
import React, { memo, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext.mjs';
import { CssClassManager } from 'ag-grid-community';
import { isComponentStateless } from '../utils.mjs';
import { showJsComp } from '../jsComp.mjs';
import { useLayoutEffectOnce } from '../useEffectOnce.mjs';
const HeaderCellComp = (props) => {
    const { context } = useContext(BeansContext);
    const [title, setTitle] = useState();
    const [colId, setColId] = useState();
    const [ariaSort, setAriaSort] = useState();
    const [ariaDescription, setAriaDescription] = useState();
    const [userCompDetails, setUserCompDetails] = useState();
    const eGui = useRef(null);
    const eResize = useRef(null);
    const eHeaderCompWrapper = useRef(null);
    const userCompRef = useRef();
    const { ctrl } = props;
    const cssClassManager = useMemo(() => new CssClassManager(() => eGui.current), []);
    useLayoutEffectOnce(() => {
        var _a;
        const compProxy = {
            setWidth: width => {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
            addOrRemoveCssClass: (name, on) => cssClassManager.addOrRemoveCssClass(name, on),
            setColId: id => setColId(id),
            setTitle: title => setTitle(title),
            setAriaDescription: description => setAriaDescription(description),
            setAriaSort: sort => setAriaSort(sort),
            setUserCompDetails: compDetails => setUserCompDetails(compDetails),
            getUserCompInstance: () => userCompRef.current || undefined
        };
        ctrl.setComp(compProxy, eGui.current, eResize.current, eHeaderCompWrapper.current);
        const selectAllGui = ctrl.getSelectAllGui();
        (_a = eResize.current) === null || _a === void 0 ? void 0 : _a.insertAdjacentElement('afterend', selectAllGui);
    });
    // js comps
    useLayoutEffect(() => showJsComp(userCompDetails, context, eHeaderCompWrapper.current, userCompRef), [userCompDetails]);
    // add drag handling, must be done after component is added to the dom
    useEffect(() => {
        ctrl.setDragSource(eGui.current);
    }, [userCompDetails]);
    const userCompStateless = useMemo(() => {
        const res = (userCompDetails === null || userCompDetails === void 0 ? void 0 : userCompDetails.componentFromFramework) && isComponentStateless(userCompDetails.componentClass);
        return !!res;
    }, [userCompDetails]);
    const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    const UserCompClass = userCompDetails && userCompDetails.componentClass;
    return (React.createElement("div", { ref: eGui, className: "ag-header-cell", title: title, "col-id": colId, "aria-sort": ariaSort, role: "columnheader", tabIndex: -1, "aria-description": ariaDescription },
        React.createElement("div", { ref: eResize, className: "ag-header-cell-resize", role: "presentation" }),
        React.createElement("div", { ref: eHeaderCompWrapper, className: "ag-header-cell-comp-wrapper", role: "presentation" },
            reactUserComp && userCompStateless && React.createElement(UserCompClass, Object.assign({}, userCompDetails.params)),
            reactUserComp && !userCompStateless && React.createElement(UserCompClass, Object.assign({}, userCompDetails.params, { ref: userCompRef })))));
};
export default memo(HeaderCellComp);
