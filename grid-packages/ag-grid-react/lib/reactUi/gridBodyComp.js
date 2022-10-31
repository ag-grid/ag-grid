// ag-grid-react v28.2.1
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
    var _c = react_1.useState(0), ariaColCount = _c[0], setAriaColCount = _c[1];
    var _d = react_1.useState(0), ariaRowCount = _d[0], setAriaRowCount = _d[1];
    var _e = react_1.useState(0), topHeight = _e[0], setTopHeight = _e[1];
    var _f = react_1.useState(0), bottomHeight = _f[0], setBottomHeight = _f[1];
    var _g = react_1.useState('0px'), stickyTopHeight = _g[0], setStickyTopHeight = _g[1];
    var _h = react_1.useState('0px'), stickyTopTop = _h[0], setStickyTopTop = _h[1];
    var _j = react_1.useState('100%'), stickyTopWidth = _j[0], setStickyTopWidth = _j[1];
    var _k = react_1.useState(''), topDisplay = _k[0], setTopDisplay = _k[1];
    var _l = react_1.useState(''), bottomDisplay = _l[0], setBottomDisplay = _l[1];
    var _m = react_1.useState(null), movingCss = _m[0], setMovingCss = _m[1];
    var _o = react_1.useState(null), forceVerticalScrollClass = _o[0], setForceVerticalScrollClass = _o[1];
    var _p = react_1.useState(''), topAndBottomOverflowY = _p[0], setTopAndBottomOverflowY = _p[1];
    var _q = react_1.useState(null), cellSelectableCss = _q[0], setCellSelectableCss = _q[1];
    // we initialise layoutClass to 'ag-layout-normal', because if we don't, the comp will initially
    // render with no width (as ag-layout-normal sets width to 0, which is needed for flex) which
    // gives the grid a massive width, which then renders a massive amount of columns. this problem
    // is due to React been async, for the non-async version (ie when not using React) this is not a
    // problem as the UI will finish initialising before we set data.
    var _r = react_1.useState('ag-layout-normal'), layoutClass = _r[0], setLayoutClass = _r[1];
    var eRoot = react_1.useRef(null);
    var eTop = react_1.useRef(null);
    var eStickyTop = react_1.useRef(null);
    var eBodyViewport = react_1.useRef(null);
    var eBottom = react_1.useRef(null);
    reactComment_1.default(' AG Grid Body ', eRoot);
    reactComment_1.default(' AG Pinned Top ', eTop);
    reactComment_1.default(' AG Sticky Top ', eStickyTop);
    reactComment_1.default(' AG Middle ', eBodyViewport);
    reactComment_1.default(' AG Pinned Bottom ', eBottom);
    useEffectOnce_1.useEffectOnce(function () {
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
        var compProxy = {
            setRowAnimationCssOnBodyViewport: setRowAnimationClass,
            setColumnCount: setAriaColCount,
            setRowCount: setAriaRowCount,
            setTopHeight: setTopHeight,
            setBottomHeight: setBottomHeight,
            setStickyTopHeight: setStickyTopHeight,
            setStickyTopTop: setStickyTopTop,
            setStickyTopWidth: setStickyTopWidth,
            setTopDisplay: setTopDisplay,
            setBottomDisplay: setBottomDisplay,
            setColumnMovingCss: setMovingCss,
            updateLayoutClasses: setLayoutClass,
            setAlwaysVerticalScrollClass: setForceVerticalScrollClass,
            setPinnedTopBottomOverflowY: setTopAndBottomOverflowY,
            setCellSelectableCss: setCellSelectableCss,
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
        return utils_1.classesList('ag-root', 'ag-unselectable', movingCss, layoutClass);
    }, [movingCss, layoutClass]);
    var bodyViewportClasses = react_1.useMemo(function () {
        return utils_1.classesList('ag-body-viewport', rowAnimationClass, layoutClass, forceVerticalScrollClass, cellSelectableCss);
    }, [rowAnimationClass, layoutClass, forceVerticalScrollClass, cellSelectableCss]);
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
    return (react_1.default.createElement("div", { ref: eRoot, className: rootClasses, role: "grid", "aria-colcount": ariaColCount, "aria-rowcount": ariaRowCount },
        react_1.default.createElement(gridHeaderComp_1.default, null),
        createSection({ section: eTop, className: topClasses, style: topStyle, children: [
                ag_grid_community_1.RowContainerName.TOP_LEFT,
                ag_grid_community_1.RowContainerName.TOP_CENTER,
                ag_grid_community_1.RowContainerName.TOP_RIGHT,
                ag_grid_community_1.RowContainerName.TOP_FULL_WIDTH,
            ] }),
        createSection({ section: eBodyViewport, className: bodyViewportClasses, children: [
                ag_grid_community_1.RowContainerName.LEFT,
                ag_grid_community_1.RowContainerName.CENTER,
                ag_grid_community_1.RowContainerName.RIGHT,
                ag_grid_community_1.RowContainerName.FULL_WIDTH,
            ] }),
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
