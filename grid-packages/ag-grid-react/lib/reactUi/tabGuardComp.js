// ag-grid-react v30.2.1
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var ag_grid_community_1 = require("ag-grid-community");
var beansContext_1 = require("./beansContext");
var TabGuardCompRef = function (props, forwardRef) {
    var children = props.children, eFocusableElement = props.eFocusableElement, onTabKeyDown = props.onTabKeyDown, gridCtrl = props.gridCtrl;
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var topTabGuardRef = react_1.useRef(null);
    var bottomTabGuardRef = react_1.useRef(null);
    var tabGuardCtrlRef = react_1.useRef();
    var setTabIndex = function (value) {
        var processedValue = value == null ? undefined : parseInt(value, 10).toString();
        [topTabGuardRef, bottomTabGuardRef].forEach(function (tabGuard) {
            var _a, _b;
            if (processedValue === undefined) {
                (_a = tabGuard.current) === null || _a === void 0 ? void 0 : _a.removeAttribute('tabindex');
            }
            else {
                (_b = tabGuard.current) === null || _b === void 0 ? void 0 : _b.setAttribute('tabindex', processedValue);
            }
        });
    };
    react_1.useImperativeHandle(forwardRef, function () { return ({
        forceFocusOutOfContainer: function () {
            var _a;
            (_a = tabGuardCtrlRef.current) === null || _a === void 0 ? void 0 : _a.forceFocusOutOfContainer();
        }
    }); });
    var setupCtrl = react_1.useCallback(function () {
        if (!topTabGuardRef.current && !bottomTabGuardRef.current) {
            // Clean up after both refs have been removed
            context.destroyBean(tabGuardCtrlRef.current);
            tabGuardCtrlRef.current = null;
            return;
        }
        if (topTabGuardRef.current && bottomTabGuardRef.current) {
            var compProxy = {
                setTabIndex: setTabIndex
            };
            tabGuardCtrlRef.current = context.createBean(new ag_grid_community_1.TabGuardCtrl({
                comp: compProxy,
                eTopGuard: topTabGuardRef.current,
                eBottomGuard: bottomTabGuardRef.current,
                eFocusableElement: eFocusableElement,
                onTabKeyDown: onTabKeyDown,
                focusInnerElement: function (fromBottom) { return gridCtrl.focusInnerElement(fromBottom); }
            }));
        }
    }, []);
    var setTopRef = react_1.useCallback(function (e) {
        topTabGuardRef.current = e;
        setupCtrl();
    }, [setupCtrl]);
    var setBottomRef = react_1.useCallback(function (e) {
        bottomTabGuardRef.current = e;
        setupCtrl();
    }, [setupCtrl]);
    var createTabGuard = function (side) {
        var className = side === 'top' ? ag_grid_community_1.TabGuardClassNames.TAB_GUARD_TOP : ag_grid_community_1.TabGuardClassNames.TAB_GUARD_BOTTOM;
        return (react_1.default.createElement("div", { className: ag_grid_community_1.TabGuardClassNames.TAB_GUARD + " " + className, role: "presentation", ref: side === 'top' ? setTopRef : setBottomRef }));
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        createTabGuard('top'),
        children,
        createTabGuard('bottom')));
};
var TabGuardComp = react_1.forwardRef(TabGuardCompRef);
exports.default = react_1.memo(TabGuardComp);
