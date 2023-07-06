// ag-grid-react v30.0.4
import React, { useRef, useState, forwardRef, useImperativeHandle, memo, useContext } from 'react';
import { TabGuardCtrl, TabGuardClassNames } from 'ag-grid-community';
import { BeansContext } from './beansContext.mjs';
import { useLayoutEffectOnce } from './useEffectOnce.mjs';
const TabGuardCompRef = (props, forwardRef) => {
    const { children, eFocusableElement, onTabKeyDown, gridCtrl } = props;
    const { context } = useContext(BeansContext);
    const topTabGuardRef = useRef(null);
    const bottomTabGuardRef = useRef(null);
    const tabGuardCtrlRef = useRef();
    const [tabIndex, setTabIndex] = useState();
    useImperativeHandle(forwardRef, () => ({
        forceFocusOutOfContainer() {
            var _a;
            (_a = tabGuardCtrlRef.current) === null || _a === void 0 ? void 0 : _a.forceFocusOutOfContainer();
        }
    }));
    useLayoutEffectOnce(() => {
        const eTopGuard = topTabGuardRef.current;
        const eBottomGuard = bottomTabGuardRef.current;
        const compProxy = {
            setTabIndex: value => value == null ? setTabIndex(undefined) : setTabIndex(parseInt(value, 10))
        };
        const ctrl = tabGuardCtrlRef.current = context.createBean(new TabGuardCtrl({
            comp: compProxy,
            eTopGuard: eTopGuard,
            eBottomGuard: eBottomGuard,
            eFocusableElement: eFocusableElement,
            onTabKeyDown: onTabKeyDown,
            focusInnerElement: fromBottom => gridCtrl.focusInnerElement(fromBottom)
        }));
        return () => {
            context.destroyBean(ctrl);
        };
    });
    const createTabGuard = (side) => {
        const className = side === 'top' ? TabGuardClassNames.TAB_GUARD_TOP : TabGuardClassNames.TAB_GUARD_BOTTOM;
        return (React.createElement("div", { className: `${TabGuardClassNames.TAB_GUARD} ${className}`, role: "presentation", tabIndex: tabIndex, ref: side === 'top' ? topTabGuardRef : bottomTabGuardRef }));
    };
    return (React.createElement(React.Fragment, null,
        createTabGuard('top'),
        children,
        createTabGuard('bottom')));
};
const TabGuardComp = forwardRef(TabGuardCompRef);
export default memo(TabGuardComp);
