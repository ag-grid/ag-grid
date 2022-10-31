// ag-grid-react v28.2.1
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var ag_grid_community_1 = require("ag-grid-community");
var beansContext_1 = require("./beansContext");
var useEffectOnce_1 = require("./useEffectOnce");
var TabGuardCompRef = function (props, forwardRef) {
    var children = props.children, eFocusableElement = props.eFocusableElement, onTabKeyDown = props.onTabKeyDown, gridCtrl = props.gridCtrl;
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var topTabGuardRef = react_1.useRef(null);
    var bottomTabGuardRef = react_1.useRef(null);
    var tabGuardCtrlRef = react_1.useRef();
    var _a = react_1.useState(), tabIndex = _a[0], setTabIndex = _a[1];
    react_1.useImperativeHandle(forwardRef, function () { return ({
        forceFocusOutOfContainer: function () {
            tabGuardCtrlRef.current.forceFocusOutOfContainer();
        }
    }); });
    useEffectOnce_1.useEffectOnce(function () {
        var eTopGuard = topTabGuardRef.current;
        var eBottomGuard = bottomTabGuardRef.current;
        var compProxy = {
            setTabIndex: function (value) { return value == null ? setTabIndex(undefined) : setTabIndex(parseInt(value, 10)); }
        };
        var ctrl = tabGuardCtrlRef.current = context.createBean(new ag_grid_community_1.TabGuardCtrl({
            comp: compProxy,
            eTopGuard: eTopGuard,
            eBottomGuard: eBottomGuard,
            eFocusableElement: eFocusableElement,
            onTabKeyDown: onTabKeyDown,
            focusInnerElement: function (fromBottom) { return gridCtrl.focusInnerElement(fromBottom); }
        }));
        return function () {
            context.destroyBean(ctrl);
        };
    });
    var createTabGuard = function (side) { return (react_1.default.createElement("div", { className: "ag-tab-guard ag-tab-guard-" + side, role: "presentation", tabIndex: tabIndex, ref: side === 'top' ? topTabGuardRef : bottomTabGuardRef })); };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        createTabGuard('top'),
        children,
        createTabGuard('bottom')));
};
var TabGuardComp = react_1.forwardRef(TabGuardCompRef);
exports.default = react_1.memo(TabGuardComp);
