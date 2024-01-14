// @ag-grid-community/react v31.0.0
import React, { memo, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BeansContext } from '../beansContext.mjs';
import { AgPromise } from '@ag-grid-community/core';
import { CssClasses, isComponentStateless } from '../utils.mjs';
import { showJsComp } from '../jsComp.mjs';
import { FloatingFilterComponentProxy } from '../../shared/customComp/floatingFilterComponentProxy.mjs';
import { CustomContext } from '../../shared/customComp/customContext.mjs';
const HeaderFilterCellComp = (props) => {
    const { context, gridOptionsService } = useContext(BeansContext);
    const [cssClasses, setCssClasses] = useState(() => new CssClasses('ag-header-cell', 'ag-floating-filter'));
    const [cssBodyClasses, setBodyCssClasses] = useState(() => new CssClasses());
    const [cssButtonWrapperClasses, setButtonWrapperCssClasses] = useState(() => new CssClasses('ag-floating-filter-button', 'ag-hidden'));
    const [buttonWrapperAriaHidden, setButtonWrapperAriaHidden] = useState("false");
    const [userCompDetails, setUserCompDetails] = useState();
    const [renderKey, setRenderKey] = useState(1);
    const eGui = useRef(null);
    const eFloatingFilterBody = useRef(null);
    const eButtonWrapper = useRef(null);
    const eButtonShowMainFilter = useRef(null);
    const userCompResolve = useRef();
    const userCompPromise = useRef();
    const userCompRef = (value) => {
        // We skip when it's un-setting
        if (value == null) {
            return;
        }
        userCompResolve.current && userCompResolve.current(value);
    };
    const { ctrl } = props;
    const setRef = useCallback((e) => {
        eGui.current = e;
        if (!eGui.current) {
            return;
        }
        userCompPromise.current = new AgPromise(resolve => {
            userCompResolve.current = resolve;
        });
        const compProxy = {
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            addOrRemoveBodyCssClass: (name, on) => setBodyCssClasses(prev => prev.setClass(name, on)),
            setButtonWrapperDisplayed: (displayed) => {
                setButtonWrapperCssClasses(prev => prev.setClass('ag-hidden', !displayed));
                setButtonWrapperAriaHidden(!displayed ? "true" : "false");
            },
            setWidth: width => {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
            setCompDetails: compDetails => setUserCompDetails(compDetails),
            getFloatingFilterComp: () => userCompPromise.current ? userCompPromise.current : null,
            setMenuIcon: eIcon => { var _a; return (_a = eButtonShowMainFilter.current) === null || _a === void 0 ? void 0 : _a.appendChild(eIcon); }
        };
        ctrl.setComp(compProxy, eGui.current, eButtonShowMainFilter.current, eFloatingFilterBody.current);
    }, []);
    // js comps
    useLayoutEffect(() => showJsComp(userCompDetails, context, eFloatingFilterBody.current, userCompRef), [userCompDetails]);
    const className = useMemo(() => cssClasses.toString(), [cssClasses]);
    const bodyClassName = useMemo(() => cssBodyClasses.toString(), [cssBodyClasses]);
    const buttonWrapperClassName = useMemo(() => cssButtonWrapperClasses.toString(), [cssButtonWrapperClasses]);
    const userCompStateless = useMemo(() => {
        const res = userCompDetails
            && userCompDetails.componentFromFramework
            && isComponentStateless(userCompDetails.componentClass);
        return !!res;
    }, [userCompDetails]);
    const reactiveCustomComponents = useMemo(() => gridOptionsService.get('reactiveCustomComponents'), []);
    const floatingFilterCompProxy = useMemo(() => {
        if (reactiveCustomComponents && userCompDetails) {
            const compProxy = new FloatingFilterComponentProxy(userCompDetails.params, () => setRenderKey(prev => prev + 1));
            userCompRef(compProxy);
            return compProxy;
        }
        return undefined;
    }, [userCompDetails]);
    const floatingFilterProps = floatingFilterCompProxy === null || floatingFilterCompProxy === void 0 ? void 0 : floatingFilterCompProxy.getProps();
    const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    const UserCompClass = userCompDetails && userCompDetails.componentClass;
    return (React.createElement("div", { ref: setRef, className: className, role: "gridcell", tabIndex: -1 },
        React.createElement("div", { ref: eFloatingFilterBody, className: bodyClassName, role: "presentation" },
            reactUserComp && !reactiveCustomComponents && React.createElement(UserCompClass, Object.assign({}, userCompDetails.params, { ref: userCompStateless ? () => { } : userCompRef })),
            reactUserComp && reactiveCustomComponents && React.createElement(CustomContext.Provider, { value: {
                    setMethods: (methods) => floatingFilterCompProxy.setMethods(methods)
                } },
                React.createElement(UserCompClass, Object.assign({}, floatingFilterProps)))),
        React.createElement("div", { ref: eButtonWrapper, "aria-hidden": buttonWrapperAriaHidden, className: buttonWrapperClassName, role: "presentation" },
            React.createElement("button", { ref: eButtonShowMainFilter, type: "button", className: "ag-button ag-floating-filter-button-button", tabIndex: -1 }))));
};
export default memo(HeaderFilterCellComp);
