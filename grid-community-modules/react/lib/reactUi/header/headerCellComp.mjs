// @ag-grid-community/react v31.0.0
import React, { memo, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext.mjs';
import { CssClassManager, _ } from '@ag-grid-community/core';
import { isComponentStateless } from '../utils.mjs';
import { showJsComp } from '../jsComp.mjs';
const HeaderCellComp = (props) => {
    const { ctrl } = props;
    const { context } = useContext(BeansContext);
    const colId = ctrl.getColId();
    const [userCompDetails, setUserCompDetails] = useState();
    const eGui = useRef(null);
    const eResize = useRef(null);
    const eHeaderCompWrapper = useRef(null);
    const userCompRef = useRef();
    let cssClassManager = useRef();
    if (!cssClassManager.current) {
        cssClassManager.current = new CssClassManager(() => eGui.current);
    }
    const setRef = useCallback((e) => {
        var _a;
        eGui.current = e;
        if (!eGui.current) {
            // Any clean up required?
            return;
        }
        const compProxy = {
            setWidth: width => {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
            addOrRemoveCssClass: (name, on) => cssClassManager.current.addOrRemoveCssClass(name, on),
            setAriaDescription: label => {
                if (eGui.current) {
                    _.setAriaDescription(eGui.current, label);
                }
            },
            setAriaSort: sort => {
                if (eGui.current) {
                    sort ? _.setAriaSort(eGui.current, sort) : _.removeAriaSort(eGui.current);
                }
            },
            setUserCompDetails: compDetails => setUserCompDetails(compDetails),
            getUserCompInstance: () => userCompRef.current || undefined
        };
        ctrl.setComp(compProxy, eGui.current, eResize.current, eHeaderCompWrapper.current);
        const selectAllGui = ctrl.getSelectAllGui();
        (_a = eResize.current) === null || _a === void 0 ? void 0 : _a.insertAdjacentElement('afterend', selectAllGui);
    }, []);
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
    return (React.createElement("div", { ref: setRef, className: "ag-header-cell", "col-id": colId, role: "columnheader", tabIndex: -1 },
        React.createElement("div", { ref: eResize, className: "ag-header-cell-resize", role: "presentation" }),
        React.createElement("div", { ref: eHeaderCompWrapper, className: "ag-header-cell-comp-wrapper", role: "presentation" },
            reactUserComp && userCompStateless && React.createElement(UserCompClass, Object.assign({}, userCompDetails.params)),
            reactUserComp && !userCompStateless && React.createElement(UserCompClass, Object.assign({}, userCompDetails.params, { ref: userCompRef })))));
};
export default memo(HeaderCellComp);
