// ag-grid-react v26.1.0
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
exports.ManagedFocusContainer = function (_a) {
    var children = _a.children, context = _a.context, eFocusableElement = _a.eFocusableElement, onTabKeyDown = _a.onTabKeyDown, gridCtrl = _a.gridCtrl;
    var topTabGuardRef = react_1.useRef(null);
    var bottomTabGuardRef = react_1.useRef(null);
    var _b = react_1.useState(), tabIndex = _b[0], setTabIndex = _b[1];
    react_1.useEffect(function () {
        var eTopGuard = topTabGuardRef.current;
        var eBottomGuard = bottomTabGuardRef.current;
        var compProxy = {
            setTabIndex: function (value) { return value == null ? setTabIndex(undefined) : setTabIndex(parseInt(value, 10)); }
        };
        var ctrl = context.createBean(new ag_grid_community_1.TabGuardCtrl({
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
    }, [context, eFocusableElement]);
    var createTabGuard = function (side) { return (react_1.default.createElement("div", { className: "ag-tab-guard ag-tab-guard-" + side, role: "presentation", tabIndex: tabIndex, ref: side === 'top' ? topTabGuardRef : bottomTabGuardRef })); };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        createTabGuard('top'),
        children,
        createTabGuard('bottom')));
};
