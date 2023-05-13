// ag-grid-react v29.3.5
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
var beansContext_1 = require("./beansContext");
var gridHeaderComp_1 = __importDefault(require("./header/gridHeaderComp"));
var reactComment_1 = __importDefault(require("./reactComment"));
var rowContainerComp_1 = __importDefault(require("./rows/rowContainerComp"));
var useEffectOnce_1 = require("./useEffectOnce");
var utils_1 = require("./utils");
var GridBodyComp = function () {
    var _a = react_1.useContext(beansContext_1.BeansContext), context = _a.context, agStackComponentsRegistry = _a.agStackComponentsRegistry, resizeObserverService = _a.resizeObserverService;
    var _b = react_1.useState(''), rowAnimationClass = _b[0], setRowAnimationClass = _b[1];
    var _c = react_1.useState(0), topHeight = _c[0], setTopHeight = _c[1];
    var _d = react_1.useState(0), bottomHeight = _d[0], setBottomHeight = _d[1];
    var _e = react_1.useState('0px'), stickyTopHeight = _e[0], setStickyTopHeight = _e[1];
    var _f = react_1.useState('0px'), stickyTopTop = _f[0], setStickyTopTop = _f[1];
    var _g = react_1.useState('100%'), stickyTopWidth = _g[0], setStickyTopWidth = _g[1];
    var _h = react_1.useState(''), topDisplay = _h[0], setTopDisplay = _h[1];
    var _j = react_1.useState(''), bottomDisplay = _j[0], setBottomDisplay = _j[1];
    var _k = react_1.useState(null), forceVerticalScrollClass = _k[0], setForceVerticalScrollClass = _k[1];
    var _l = react_1.useState(''), topAndBottomOverflowY = _l[0], setTopAndBottomOverflowY = _l[1];
    var _m = react_1.useState(null), cellSelectableCss = _m[0], setCellSelectableCss = _m[1];
    // we initialise layoutClass to 'ag-layout-normal', because if we don't, the comp will initially
    // render with no width (as ag-layout-normal sets width to 0, which is needed for flex) which
    // gives the grid a massive width, which then renders a massive amount of columns. this problem
    // is due to React been async, for the non-async version (ie when not using React) this is not a
    // problem as the UI will finish initialising before we set data.
    var _o = react_1.useState('ag-layout-normal'), layoutClass = _o[0], setLayoutClass = _o[1];
    var cssClassManager = react_1.useMemo(function () { return new ag_grid_community_1.CssClassManager(function () { return eRoot.current; }); }, []);
    var eRoot = react_1.useRef(null);
    var eTop = react_1.useRef(null);
    var eStickyTop = react_1.useRef(null);
    var eBody = react_1.useRef(null);
    var eBodyViewport = react_1.useRef(null);
    var eBottom = react_1.useRef(null);
    reactComment_1.default(' AG Grid Body ', eRoot);
    reactComment_1.default(' AG Pinned Top ', eTop);
    reactComment_1.default(' AG Sticky Top ', eStickyTop);
    reactComment_1.default(' AG Middle ', eBodyViewport);
    reactComment_1.default(' AG Pinned Bottom ', eBottom);
    useEffectOnce_1.useLayoutEffectOnce(function () {
        var beansToDestroy = [];
        var destroyFuncs = [];
        if (!context) {
            return;
        }
        var newComp = function (tag) {
            var CompClass = agStackComponentsRegistry.getComponentClass(tag);
            var comp = context.createBean(new CompClass());
            beansToDestroy.push(comp);
            return comp;
        };
        eRoot.current.appendChild(document.createComment(' AG Fake Horizontal Scroll '));
        eRoot.current.appendChild(newComp('AG-FAKE-HORIZONTAL-SCROLL').getGui());
        eRoot.current.appendChild(document.createComment(' AG Overlay Wrapper '));
        eRoot.current.appendChild(newComp('AG-OVERLAY-WRAPPER').getGui());
        eBody.current.appendChild(document.createComment(' AG Fake Vertical Scroll '));
        eBody.current.appendChild(newComp('AG-FAKE-VERTICAL-SCROLL').getGui());
        var compProxy = {
            setRowAnimationCssOnBodyViewport: setRowAnimationClass,
            setColumnCount: function (count) { return ag_grid_community_1._.setAriaColCount(eRoot.current, count); },
            setRowCount: function (count) { return ag_grid_community_1._.setAriaRowCount(eRoot.current, count); },
            setTopHeight: setTopHeight,
            setBottomHeight: setBottomHeight,
            setStickyTopHeight: setStickyTopHeight,
            setStickyTopTop: setStickyTopTop,
            setStickyTopWidth: setStickyTopWidth,
            setTopDisplay: setTopDisplay,
            setBottomDisplay: setBottomDisplay,
            setColumnMovingCss: function (cssClass, flag) { return cssClassManager.addOrRemoveCssClass(cssClass, flag); },
            updateLayoutClasses: setLayoutClass,
            setAlwaysVerticalScrollClass: setForceVerticalScrollClass,
            setPinnedTopBottomOverflowY: setTopAndBottomOverflowY,
            setCellSelectableCss: setCellSelectableCss,
            setBodyViewportWidth: function (width) { return eBodyViewport.current.style.width = width; },
            registerBodyViewportResizeListener: function (listener) {
                var unsubscribeFromResize = resizeObserverService.observeResize(eBodyViewport.current, listener);
                destroyFuncs.push(function () { return unsubscribeFromResize(); });
            }
        };
        var ctrl = context.createBean(new ag_grid_community_1.GridBodyCtrl());
        beansToDestroy.push(ctrl);
        ctrl.setComp(compProxy, eRoot.current, eBodyViewport.current, eTop.current, eBottom.current, eStickyTop.current);
        return function () {
            context.destroyBeans(beansToDestroy);
            destroyFuncs.forEach(function (f) { return f(); });
        };
    });
    var rootClasses = react_1.useMemo(function () {
        return utils_1.classesList('ag-root', 'ag-unselectable', layoutClass);
    }, [layoutClass]);
    var bodyViewportClasses = react_1.useMemo(function () {
        return utils_1.classesList('ag-body-viewport', rowAnimationClass, layoutClass, forceVerticalScrollClass, cellSelectableCss);
    }, [rowAnimationClass, layoutClass, forceVerticalScrollClass, cellSelectableCss]);
    var bodyClasses = react_1.useMemo(function () {
        return utils_1.classesList('ag-body', layoutClass);
    }, [layoutClass]);
    var bodyClipperClasses = react_1.useMemo(function () {
        return utils_1.classesList('ag-body-clipper', layoutClass);
    }, [layoutClass]);
    var topClasses = react_1.useMemo(function () {
        return utils_1.classesList('ag-floating-top', cellSelectableCss);
    }, [cellSelectableCss]);
    var stickyTopClasses = react_1.useMemo(function () {
        return utils_1.classesList('ag-sticky-top', cellSelectableCss);
    }, [cellSelectableCss]);
    var bottomClasses = react_1.useMemo(function () {
        return utils_1.classesList('ag-floating-bottom', cellSelectableCss);
    }, [cellSelectableCss]);
    var topStyle = react_1.useMemo(function () { return ({
        height: topHeight,
        minHeight: topHeight,
        display: topDisplay,
        overflowY: topAndBottomOverflowY
    }); }, [topHeight, topDisplay, topAndBottomOverflowY]);
    var stickyTopStyle = react_1.useMemo(function () { return ({
        height: stickyTopHeight,
        top: stickyTopTop,
        width: stickyTopWidth
    }); }, [stickyTopHeight, stickyTopTop, stickyTopWidth]);
    var bottomStyle = react_1.useMemo(function () { return ({
        height: bottomHeight,
        minHeight: bottomHeight,
        display: bottomDisplay,
        overflowY: topAndBottomOverflowY
    }); }, [bottomHeight, bottomDisplay, topAndBottomOverflowY]);
    var createRowContainer = function (container) { return react_1.default.createElement(rowContainerComp_1.default, { name: container, key: container + "-container" }); };
    var createSection = function (_a) {
        var section = _a.section, children = _a.children, className = _a.className, style = _a.style;
        return (react_1.default.createElement("div", { ref: section, className: className, role: "presentation", style: style }, children.map(createRowContainer)));
    };
    return (react_1.default.createElement("div", { ref: eRoot, className: rootClasses, role: "treegrid" },
        react_1.default.createElement(gridHeaderComp_1.default, null),
        createSection({ section: eTop, className: topClasses, style: topStyle, children: [
                ag_grid_community_1.RowContainerName.TOP_LEFT,
                ag_grid_community_1.RowContainerName.TOP_CENTER,
                ag_grid_community_1.RowContainerName.TOP_RIGHT,
                ag_grid_community_1.RowContainerName.TOP_FULL_WIDTH,
            ] }),
        react_1.default.createElement("div", { className: bodyClasses, ref: eBody, role: "presentation" },
            react_1.default.createElement("div", { className: bodyClipperClasses, role: "presentation" }, createSection({ section: eBodyViewport, className: bodyViewportClasses,
                children: [
                    ag_grid_community_1.RowContainerName.LEFT,
                    ag_grid_community_1.RowContainerName.CENTER,
                    ag_grid_community_1.RowContainerName.RIGHT,
                    ag_grid_community_1.RowContainerName.FULL_WIDTH,
                ] }))),
        createSection({ section: eStickyTop, className: stickyTopClasses, style: stickyTopStyle, children: [
                ag_grid_community_1.RowContainerName.STICKY_TOP_LEFT,
                ag_grid_community_1.RowContainerName.STICKY_TOP_CENTER,
                ag_grid_community_1.RowContainerName.STICKY_TOP_RIGHT,
                ag_grid_community_1.RowContainerName.STICKY_TOP_FULL_WIDTH,
            ] }),
        createSection({ section: eBottom, className: bottomClasses, style: bottomStyle, children: [
                ag_grid_community_1.RowContainerName.BOTTOM_LEFT,
                ag_grid_community_1.RowContainerName.BOTTOM_CENTER,
                ag_grid_community_1.RowContainerName.BOTTOM_RIGHT,
                ag_grid_community_1.RowContainerName.BOTTOM_FULL_WIDTH,
            ] })));
};
exports.default = react_1.memo(GridBodyComp);
