// @ag-grid-community/react v29.1.0
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
const beansContext_1 = require("./beansContext");
const gridHeaderComp_1 = __importDefault(require("./header/gridHeaderComp"));
const reactComment_1 = __importDefault(require("./reactComment"));
const rowContainerComp_1 = __importDefault(require("./rows/rowContainerComp"));
const useEffectOnce_1 = require("./useEffectOnce");
const utils_1 = require("./utils");
const GridBodyComp = () => {
    const { context, agStackComponentsRegistry, resizeObserverService } = react_1.useContext(beansContext_1.BeansContext);
    const [rowAnimationClass, setRowAnimationClass] = react_1.useState('');
    const [ariaColCount, setAriaColCount] = react_1.useState(0);
    const [ariaRowCount, setAriaRowCount] = react_1.useState(0);
    const [topHeight, setTopHeight] = react_1.useState(0);
    const [bottomHeight, setBottomHeight] = react_1.useState(0);
    const [stickyTopHeight, setStickyTopHeight] = react_1.useState('0px');
    const [stickyTopTop, setStickyTopTop] = react_1.useState('0px');
    const [stickyTopWidth, setStickyTopWidth] = react_1.useState('100%');
    const [topDisplay, setTopDisplay] = react_1.useState('');
    const [bottomDisplay, setBottomDisplay] = react_1.useState('');
    const [bodyViewportWidth, setBodyViewportWidth] = react_1.useState('');
    const [movingCss, setMovingCss] = react_1.useState(null);
    const [forceVerticalScrollClass, setForceVerticalScrollClass] = react_1.useState(null);
    const [topAndBottomOverflowY, setTopAndBottomOverflowY] = react_1.useState('');
    const [cellSelectableCss, setCellSelectableCss] = react_1.useState(null);
    // we initialise layoutClass to 'ag-layout-normal', because if we don't, the comp will initially
    // render with no width (as ag-layout-normal sets width to 0, which is needed for flex) which
    // gives the grid a massive width, which then renders a massive amount of columns. this problem
    // is due to React been async, for the non-async version (ie when not using React) this is not a
    // problem as the UI will finish initialising before we set data.
    const [layoutClass, setLayoutClass] = react_1.useState('ag-layout-normal');
    const eRoot = react_1.useRef(null);
    const eTop = react_1.useRef(null);
    const eStickyTop = react_1.useRef(null);
    const eBody = react_1.useRef(null);
    const eBodyViewport = react_1.useRef(null);
    const eBottom = react_1.useRef(null);
    reactComment_1.default(' AG Grid Body ', eRoot);
    reactComment_1.default(' AG Pinned Top ', eTop);
    reactComment_1.default(' AG Sticky Top ', eStickyTop);
    reactComment_1.default(' AG Middle ', eBodyViewport);
    reactComment_1.default(' AG Pinned Bottom ', eBottom);
    useEffectOnce_1.useEffectOnce(() => {
        const beansToDestroy = [];
        const destroyFuncs = [];
        if (!context) {
            return;
        }
        const newComp = (tag) => {
            const CompClass = agStackComponentsRegistry.getComponentClass(tag);
            const comp = context.createBean(new CompClass());
            beansToDestroy.push(comp);
            return comp;
        };
        eRoot.current.appendChild(document.createComment(' AG Fake Horizontal Scroll '));
        eRoot.current.appendChild(newComp('AG-FAKE-HORIZONTAL-SCROLL').getGui());
        eRoot.current.appendChild(document.createComment(' AG Overlay Wrapper '));
        eRoot.current.appendChild(newComp('AG-OVERLAY-WRAPPER').getGui());
        eBody.current.appendChild(document.createComment(' AG Fake Vertical Scroll '));
        eBody.current.appendChild(newComp('AG-FAKE-VERTICAL-SCROLL').getGui());
        const compProxy = {
            setRowAnimationCssOnBodyViewport: setRowAnimationClass,
            setColumnCount: setAriaColCount,
            setRowCount: setAriaRowCount,
            setTopHeight,
            setBottomHeight,
            setStickyTopHeight,
            setStickyTopTop,
            setStickyTopWidth,
            setTopDisplay,
            setBottomDisplay,
            setColumnMovingCss: setMovingCss,
            updateLayoutClasses: setLayoutClass,
            setAlwaysVerticalScrollClass: setForceVerticalScrollClass,
            setPinnedTopBottomOverflowY: setTopAndBottomOverflowY,
            setCellSelectableCss: setCellSelectableCss,
            setBodyViewportWidth: setBodyViewportWidth,
            registerBodyViewportResizeListener: listener => {
                const unsubscribeFromResize = resizeObserverService.observeResize(eBodyViewport.current, listener);
                destroyFuncs.push(() => unsubscribeFromResize());
            }
        };
        const ctrl = context.createBean(new core_1.GridBodyCtrl());
        beansToDestroy.push(ctrl);
        ctrl.setComp(compProxy, eRoot.current, eBodyViewport.current, eTop.current, eBottom.current, eStickyTop.current);
        return () => {
            context.destroyBeans(beansToDestroy);
            destroyFuncs.forEach(f => f());
        };
    });
    const rootClasses = react_1.useMemo(() => utils_1.classesList('ag-root', 'ag-unselectable', movingCss, layoutClass), [movingCss, layoutClass]);
    const bodyViewportClasses = react_1.useMemo(() => utils_1.classesList('ag-body-viewport', rowAnimationClass, layoutClass, forceVerticalScrollClass, cellSelectableCss), [rowAnimationClass, layoutClass, forceVerticalScrollClass, cellSelectableCss]);
    const bodyClasses = react_1.useMemo(() => utils_1.classesList('ag-body', layoutClass), [layoutClass]);
    const bodyClipperClasses = react_1.useMemo(() => utils_1.classesList('ag-body-clipper', layoutClass), [layoutClass]);
    const topClasses = react_1.useMemo(() => utils_1.classesList('ag-floating-top', cellSelectableCss), [cellSelectableCss]);
    const stickyTopClasses = react_1.useMemo(() => utils_1.classesList('ag-sticky-top', cellSelectableCss), [cellSelectableCss]);
    const bottomClasses = react_1.useMemo(() => utils_1.classesList('ag-floating-bottom', cellSelectableCss), [cellSelectableCss]);
    const topStyle = react_1.useMemo(() => ({
        height: topHeight,
        minHeight: topHeight,
        display: topDisplay,
        overflowY: topAndBottomOverflowY
    }), [topHeight, topDisplay, topAndBottomOverflowY]);
    const stickyTopStyle = react_1.useMemo(() => ({
        height: stickyTopHeight,
        top: stickyTopTop,
        width: stickyTopWidth
    }), [stickyTopHeight, stickyTopTop, stickyTopWidth]);
    const bottomStyle = react_1.useMemo(() => ({
        height: bottomHeight,
        minHeight: bottomHeight,
        display: bottomDisplay,
        overflowY: topAndBottomOverflowY
    }), [bottomHeight, bottomDisplay, topAndBottomOverflowY]);
    const bodyViewportStyle = react_1.useMemo(() => ({
        width: bodyViewportWidth
    }), [bodyViewportWidth]);
    const createRowContainer = (container) => react_1.default.createElement(rowContainerComp_1.default, { name: container, key: `${container}-container` });
    const createSection = ({ section, children, className, style }) => (react_1.default.createElement("div", { ref: section, className: className, role: "presentation", style: style }, children.map(createRowContainer)));
    return (react_1.default.createElement("div", { ref: eRoot, className: rootClasses, role: "treegrid", "aria-colcount": ariaColCount, "aria-rowcount": ariaRowCount },
        react_1.default.createElement(gridHeaderComp_1.default, null),
        createSection({ section: eTop, className: topClasses, style: topStyle, children: [
                core_1.RowContainerName.TOP_LEFT,
                core_1.RowContainerName.TOP_CENTER,
                core_1.RowContainerName.TOP_RIGHT,
                core_1.RowContainerName.TOP_FULL_WIDTH,
            ] }),
        react_1.default.createElement("div", { className: bodyClasses, ref: eBody, role: "presentation" },
            react_1.default.createElement("div", { className: bodyClipperClasses, role: "presentation" }, createSection({ section: eBodyViewport, className: bodyViewportClasses,
                style: bodyViewportStyle, children: [
                    core_1.RowContainerName.LEFT,
                    core_1.RowContainerName.CENTER,
                    core_1.RowContainerName.RIGHT,
                    core_1.RowContainerName.FULL_WIDTH,
                ] }))),
        createSection({ section: eStickyTop, className: stickyTopClasses, style: stickyTopStyle, children: [
                core_1.RowContainerName.STICKY_TOP_LEFT,
                core_1.RowContainerName.STICKY_TOP_CENTER,
                core_1.RowContainerName.STICKY_TOP_RIGHT,
                core_1.RowContainerName.STICKY_TOP_FULL_WIDTH,
            ] }),
        createSection({ section: eBottom, className: bottomClasses, style: bottomStyle, children: [
                core_1.RowContainerName.BOTTOM_LEFT,
                core_1.RowContainerName.BOTTOM_CENTER,
                core_1.RowContainerName.BOTTOM_RIGHT,
                core_1.RowContainerName.BOTTOM_FULL_WIDTH,
            ] })));
};
exports.default = react_1.memo(GridBodyComp);

//# sourceMappingURL=gridBodyComp.js.map
