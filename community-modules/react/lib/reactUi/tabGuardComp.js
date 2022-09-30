// @ag-grid-community/react v28.2.0
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const core_1 = require("@ag-grid-community/core");
const beansContext_1 = require("./beansContext");
const useEffectOnce_1 = require("./useEffectOnce");
const TabGuardCompRef = (props, forwardRef) => {
    const { children, eFocusableElement, onTabKeyDown, gridCtrl } = props;
    const { context } = react_1.useContext(beansContext_1.BeansContext);
    const topTabGuardRef = react_1.useRef(null);
    const bottomTabGuardRef = react_1.useRef(null);
    const tabGuardCtrlRef = react_1.useRef();
    const [tabIndex, setTabIndex] = react_1.useState();
    react_1.useImperativeHandle(forwardRef, () => ({
        forceFocusOutOfContainer() {
            tabGuardCtrlRef.current.forceFocusOutOfContainer();
        }
    }));
    useEffectOnce_1.useEffectOnce(() => {
        const eTopGuard = topTabGuardRef.current;
        const eBottomGuard = bottomTabGuardRef.current;
        const compProxy = {
            setTabIndex: value => value == null ? setTabIndex(undefined) : setTabIndex(parseInt(value, 10))
        };
        const ctrl = tabGuardCtrlRef.current = context.createBean(new core_1.TabGuardCtrl({
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
    const createTabGuard = (side) => (react_1.default.createElement("div", { className: `ag-tab-guard ag-tab-guard-${side}`, role: "presentation", tabIndex: tabIndex, ref: side === 'top' ? topTabGuardRef : bottomTabGuardRef }));
    return (react_1.default.createElement(react_1.default.Fragment, null,
        createTabGuard('top'),
        children,
        createTabGuard('bottom')));
};
const TabGuardComp = react_1.forwardRef(TabGuardCompRef);
exports.default = react_1.memo(TabGuardComp);

//# sourceMappingURL=tabGuardComp.js.map
