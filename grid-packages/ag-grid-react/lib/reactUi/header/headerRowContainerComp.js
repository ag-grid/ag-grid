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
var react_1 = __importStar(require("react"));
var beansContext_1 = require("../beansContext");
var ag_grid_community_1 = require("ag-grid-community");
var headerRowComp_1 = __importDefault(require("./headerRowComp"));
var HeaderRowContainerComp = function (props) {
    var _a = react_1.useState(true), displayed = _a[0], setDisplayed = _a[1];
    var _b = react_1.useState([]), headerRowCtrls = _b[0], setHeaderRowCtrls = _b[1];
    var context = react_1.useContext(beansContext_1.BeansContext).context;
    var eGui = react_1.useRef(null);
    var eCenterContainer = react_1.useRef(null);
    var headerRowCtrlRef = react_1.useRef(null);
    var pinnedLeft = props.pinned === 'left';
    var pinnedRight = props.pinned === 'right';
    var centre = !pinnedLeft && !pinnedRight;
    var setRef = react_1.useCallback(function (e) {
        eGui.current = e;
        if (!eGui.current) {
            context.destroyBean(headerRowCtrlRef.current);
            headerRowCtrlRef.current = null;
            return;
        }
        var compProxy = {
            setDisplayed: setDisplayed,
            setCtrls: function (ctrls) { return setHeaderRowCtrls(ctrls); },
            // centre only
            setCenterWidth: function (width) {
                if (eCenterContainer.current) {
                    eCenterContainer.current.style.width = width;
                }
            },
            setViewportScrollLeft: function (left) {
                if (eGui.current) {
                    eGui.current.scrollLeft = left;
                }
            },
            // pinned only
            setPinnedContainerWidth: function (width) {
                if (eGui.current) {
                    eGui.current.style.width = width;
                    eGui.current.style.minWidth = width;
                    eGui.current.style.maxWidth = width;
                }
            }
        };
        headerRowCtrlRef.current = context.createBean(new ag_grid_community_1.HeaderRowContainerCtrl(props.pinned));
        headerRowCtrlRef.current.setComp(compProxy, eGui.current);
    }, []);
    var className = !displayed ? 'ag-hidden' : '';
    var insertRowsJsx = function () { return headerRowCtrls.map(function (ctrl) { return react_1.default.createElement(headerRowComp_1.default, { ctrl: ctrl, key: ctrl.getInstanceId() }); }); };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        pinnedLeft &&
            react_1.default.createElement("div", { ref: setRef, className: "ag-pinned-left-header " + className, "aria-hidden": !displayed, role: "presentation" }, insertRowsJsx()),
        pinnedRight &&
            react_1.default.createElement("div", { ref: setRef, className: "ag-pinned-right-header " + className, "aria-hidden": !displayed, role: "presentation" }, insertRowsJsx()),
        centre &&
            react_1.default.createElement("div", { ref: setRef, className: "ag-header-viewport " + className, role: "presentation" },
                react_1.default.createElement("div", { ref: eCenterContainer, className: "ag-header-container", role: "rowgroup" }, insertRowsJsx()))));
};
exports.default = react_1.memo(HeaderRowContainerComp);
