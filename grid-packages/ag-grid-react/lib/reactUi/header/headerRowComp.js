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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var react_1 = __importStar(require("react"));
var headerCellComp_1 = __importDefault(require("./headerCellComp"));
var headerGroupCellComp_1 = __importDefault(require("./headerGroupCellComp"));
var headerFilterCellComp_1 = __importDefault(require("./headerFilterCellComp"));
var utils_1 = require("../utils");
var HeaderRowComp = function (props) {
    var ctrl = props.ctrl;
    var _a = react_1.useMemo(function () { return ctrl.getTopAndHeight(); }, []), topOffset = _a.topOffset, rowHeight = _a.rowHeight;
    var ariaRowIndex = ctrl.getAriaRowIndex();
    var className = ctrl.getHeaderRowClass();
    var transform = react_1.useMemo(function () { return ctrl.getTransform(); }, []);
    var _b = react_1.useState(function () { return rowHeight + 'px'; }), height = _b[0], setHeight = _b[1];
    var _c = react_1.useState(function () { return topOffset + 'px'; }), top = _c[0], setTop = _c[1];
    var _d = react_1.useState(function () { return ctrl.getHeaderCtrls(); }), cellCtrls = _d[0], setCellCtrls = _d[1];
    var eGui = react_1.useRef(null);
    var setRef = react_1.useCallback(function (e) {
        eGui.current = e;
        if (!e) {
            return;
        }
        var compProxy = {
            setHeight: function (height) { return setHeight(height); },
            setTop: function (top) { return setTop(top); },
            setHeaderCtrls: function (ctrls, forceOrder, afterScroll) {
                utils_1.agFlushSync(afterScroll, function () {
                    setCellCtrls(function (prev) { return utils_1.getNextValueIfDifferent(prev, ctrls, forceOrder); });
                });
            },
            setWidth: function (width) {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
        };
        ctrl.setComp(compProxy, false);
    }, []);
    var style = react_1.useMemo(function () { return ({
        transform: transform,
        height: height,
        top: top,
    }); }, [transform, height, top]);
    var createCellJsx = react_1.useCallback(function (cellCtrl) {
        switch (ctrl.getType()) {
            case ag_grid_community_1.HeaderRowType.COLUMN_GROUP:
                return react_1.default.createElement(headerGroupCellComp_1.default, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
            case ag_grid_community_1.HeaderRowType.FLOATING_FILTER:
                return react_1.default.createElement(headerFilterCellComp_1.default, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
            default:
                return react_1.default.createElement(headerCellComp_1.default, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
        }
    }, []);
    return (react_1.default.createElement("div", { ref: setRef, className: className, role: "row", style: style, "aria-rowindex": ariaRowIndex }, cellCtrls.map(createCellJsx)));
};
exports.default = react_1.memo(HeaderRowComp);
