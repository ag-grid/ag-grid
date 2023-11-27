// @ag-grid-community/react v31.0.0
import React, { forwardRef, memo, useCallback, useContext, useImperativeHandle, useRef } from 'react';
import { TabGuardClassNames, TabGuardCtrl } from '@ag-grid-community/core';
import { BeansContext } from './beansContext.mjs';
const TabGuardCompRef = (props, forwardRef) => {
    const { children, eFocusableElement, onTabKeyDown, gridCtrl } = props;
    const { context } = useContext(BeansContext);
    const topTabGuardRef = useRef(null);
    const bottomTabGuardRef = useRef(null);
    const tabGuardCtrlRef = useRef();
    const setTabIndex = (value) => {
        const processedValue = value == null ? undefined : parseInt(value, 10).toString();
        [topTabGuardRef, bottomTabGuardRef].forEach(tabGuard => {
            var _a, _b;
            if (processedValue === undefined) {
                (_a = tabGuard.current) === null || _a === void 0 ? void 0 : _a.removeAttribute('tabindex');
            }
            else {
                (_b = tabGuard.current) === null || _b === void 0 ? void 0 : _b.setAttribute('tabindex', processedValue);
            }
        });
    };
    useImperativeHandle(forwardRef, () => ({
        forceFocusOutOfContainer() {
            var _a;
            (_a = tabGuardCtrlRef.current) === null || _a === void 0 ? void 0 : _a.forceFocusOutOfContainer();
        }
    }));
    const setupCtrl = useCallback(() => {
        if (!topTabGuardRef.current && !bottomTabGuardRef.current) {
            // Clean up after both refs have been removed
            context.destroyBean(tabGuardCtrlRef.current);
            tabGuardCtrlRef.current = null;
            return;
        }
        if (topTabGuardRef.current && bottomTabGuardRef.current) {
            const compProxy = {
                setTabIndex
            };
            tabGuardCtrlRef.current = context.createBean(new TabGuardCtrl({
                comp: compProxy,
                eTopGuard: topTabGuardRef.current,
                eBottomGuard: bottomTabGuardRef.current,
                eFocusableElement: eFocusableElement,
                onTabKeyDown: onTabKeyDown,
                focusInnerElement: (fromBottom) => gridCtrl.focusInnerElement(fromBottom)
            }));
        }
    }, []);
    const setTopRef = useCallback((e) => {
        topTabGuardRef.current = e;
        setupCtrl();
    }, [setupCtrl]);
    const setBottomRef = useCallback((e) => {
        bottomTabGuardRef.current = e;
        setupCtrl();
    }, [setupCtrl]);
    const createTabGuard = (side) => {
        const className = side === 'top' ? TabGuardClassNames.TAB_GUARD_TOP : TabGuardClassNames.TAB_GUARD_BOTTOM;
        return (React.createElement("div", { className: `${TabGuardClassNames.TAB_GUARD} ${className}`, role: "presentation", ref: side === 'top' ? setTopRef : setBottomRef }));
    };
    return (React.createElement(React.Fragment, null,
        createTabGuard('top'),
        children,
        createTabGuard('bottom')));
};
const TabGuardComp = forwardRef(TabGuardCompRef);
export default memo(TabGuardComp);
