// @ag-grid-community/react v30.0.0
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
const core_1 = require("@ag-grid-community/core");
const react_1 = __importStar(require("react"));
const utils_1 = require("../utils");
const reactComment_1 = __importDefault(require("../reactComment"));
const rowComp_1 = __importDefault(require("./rowComp"));
const beansContext_1 = require("../beansContext");
const useEffectOnce_1 = require("../useEffectOnce");
const RowContainerComp = (params) => {
    const { context } = react_1.useContext(beansContext_1.BeansContext);
    const [rowCtrlsOrdered, setRowCtrlsOrdered] = react_1.useState([]);
    const { name } = params;
    const containerType = react_1.useMemo(() => core_1.getRowContainerTypeForName(name), [name]);
    const eWrapper = react_1.useRef(null);
    const eViewport = react_1.useRef(null);
    const eContainer = react_1.useRef(null);
    const rowCtrlsRef = react_1.useRef([]);
    const domOrderRef = react_1.useRef(false);
    const cssClasses = react_1.useMemo(() => core_1.RowContainerCtrl.getRowContainerCssClasses(name), [name]);
    const wrapperClasses = react_1.useMemo(() => utils_1.classesList(cssClasses.wrapper), []);
    const viewportClasses = react_1.useMemo(() => utils_1.classesList(cssClasses.viewport), []);
    const containerClasses = react_1.useMemo(() => utils_1.classesList(cssClasses.container), []);
    // no need to useMemo for boolean types
    const template1 = name === core_1.RowContainerName.CENTER;
    const template2 = name === core_1.RowContainerName.TOP_CENTER
        || name === core_1.RowContainerName.BOTTOM_CENTER
        || name === core_1.RowContainerName.STICKY_TOP_CENTER;
    const template3 = !template1 && !template2;
    const topLevelRef = template1 ? eWrapper : template2 ? eViewport : eContainer;
    reactComment_1.default(' AG Row Container ' + name + ' ', topLevelRef);
    // if domOrder=true, then we just copy rowCtrls into rowCtrlsOrdered observing order,
    // however if false, then we need to keep the order as they are in the dom, otherwise rowAnimation breaks
    function updateRowCtrlsOrdered(useFlushSync) {
        utils_1.agFlushSync(useFlushSync, () => {
            setRowCtrlsOrdered(prev => {
                const rowCtrls = rowCtrlsRef.current;
                if (domOrderRef.current) {
                    return rowCtrls;
                }
                // if dom order not important, we don't want to change the order
                // of the elements in the dom, as this would break transition styles
                const oldRows = prev.filter(r => rowCtrls.indexOf(r) >= 0);
                const newRows = rowCtrls.filter(r => oldRows.indexOf(r) < 0);
                return [...oldRows, ...newRows];
            });
        });
    }
    useEffectOnce_1.useLayoutEffectOnce(() => {
        const beansToDestroy = [];
        const compProxy = {
            setViewportHeight: (height) => {
                if (eViewport.current) {
                    eViewport.current.style.height = height;
                }
            },
            setRowCtrls: (rowCtrls, useFlushSync) => {
                if (rowCtrlsRef.current !== rowCtrls) {
                    const useFlush = useFlushSync && rowCtrlsRef.current.length > 0 && rowCtrls.length > 0;
                    rowCtrlsRef.current = rowCtrls;
                    updateRowCtrlsOrdered(useFlush);
                }
            },
            setDomOrder: domOrder => {
                if (domOrderRef.current != domOrder) {
                    domOrderRef.current = domOrder;
                    updateRowCtrlsOrdered(false);
                }
            },
            setContainerWidth: width => {
                if (eContainer.current) {
                    eContainer.current.style.width = width;
                }
            }
        };
        const ctrl = context.createBean(new core_1.RowContainerCtrl(name));
        beansToDestroy.push(ctrl);
        ctrl.setComp(compProxy, eContainer.current, eViewport.current, eWrapper.current);
        return () => {
            context.destroyBeans(beansToDestroy);
        };
    });
    const buildContainer = () => (react_1.default.createElement("div", { className: containerClasses, ref: eContainer, role: rowCtrlsOrdered.length ? "rowgroup" : "presentation" }, rowCtrlsOrdered.map(rowCtrl => react_1.default.createElement(rowComp_1.default, { rowCtrl: rowCtrl, containerType: containerType, key: rowCtrl.getInstanceId() }))));
    return (react_1.default.createElement(react_1.default.Fragment, null,
        template1 &&
            react_1.default.createElement("div", { className: wrapperClasses, ref: eWrapper, role: "presentation" },
                react_1.default.createElement("div", { className: viewportClasses, ref: eViewport, role: "presentation" }, buildContainer())),
        template2 &&
            react_1.default.createElement("div", { className: viewportClasses, ref: eViewport, role: "presentation" }, buildContainer()),
        template3 && buildContainer()));
};
exports.default = react_1.memo(RowContainerComp);

//# sourceMappingURL=rowContainerComp.js.map
