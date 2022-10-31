// @ag-grid-community/react v28.2.1
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
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
    const [viewportHeight, setViewportHeight] = react_1.useState('');
    const [rowCtrlsOrdered, setRowCtrlsOrdered] = react_1.useState([]);
    const [rowCtrls, setRowCtrls] = react_1.useState([]);
    const [domOrder, setDomOrder] = react_1.useState(false);
    const [containerWidth, setContainerWidth] = react_1.useState('');
    const { name } = params;
    const containerType = react_1.useMemo(() => core_1.getRowContainerTypeForName(name), [name]);
    const eWrapper = react_1.useRef(null);
    const eViewport = react_1.useRef(null);
    const eContainer = react_1.useRef(null);
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
    react_1.useEffect(() => {
        setRowCtrlsOrdered(prev => {
            if (domOrder) {
                return rowCtrls;
            }
            // if dom order not important, we don't want to change the order
            // of the elements in the dom, as this would break transition styles
            const oldRows = prev.filter(r => rowCtrls.indexOf(r) >= 0);
            const newRows = rowCtrls.filter(r => oldRows.indexOf(r) < 0);
            const next = [...oldRows, ...newRows];
            return next;
        });
    }, [domOrder, rowCtrls]);
    useEffectOnce_1.useEffectOnce(() => {
        const beansToDestroy = [];
        const compProxy = {
            setViewportHeight: setViewportHeight,
            setRowCtrls: rowCtrls => setRowCtrls(rowCtrls),
            setDomOrder: domOrder => setDomOrder(domOrder),
            setContainerWidth: width => setContainerWidth(width)
        };
        const ctrl = context.createBean(new core_1.RowContainerCtrl(name));
        beansToDestroy.push(ctrl);
        ctrl.setComp(compProxy, eContainer.current, eViewport.current, eWrapper.current);
        return () => {
            context.destroyBeans(beansToDestroy);
        };
    });
    const viewportStyle = react_1.useMemo(() => ({
        height: viewportHeight
    }), [viewportHeight]);
    const containerStyle = react_1.useMemo(() => ({
        width: containerWidth
    }), [containerWidth]);
    const buildContainer = () => (react_1.default.createElement("div", { className: containerClasses, ref: eContainer, role: rowCtrls.length ? "rowgroup" : "presentation", style: containerStyle }, rowCtrlsOrdered.map(rowCtrl => react_1.default.createElement(rowComp_1.default, { rowCtrl: rowCtrl, containerType: containerType, key: rowCtrl.getInstanceId() }))));
    return (react_1.default.createElement(react_1.default.Fragment, null,
        template1 &&
            react_1.default.createElement("div", { className: wrapperClasses, ref: eWrapper, role: "presentation" },
                react_1.default.createElement("div", { className: viewportClasses, ref: eViewport, role: "presentation", style: viewportStyle }, buildContainer())),
        template2 &&
            react_1.default.createElement("div", { className: viewportClasses, ref: eViewport, role: "presentation", style: viewportStyle }, buildContainer()),
        template3 && buildContainer()));
};
exports.default = react_1.memo(RowContainerComp);

//# sourceMappingURL=rowContainerComp.js.map
