// ag-charts-react v3.0.0
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var PropTypes = require("prop-types");
var ag_charts_community_1 = require("ag-charts-community");
var AgChartsReact = /** @class */ (function (_super) {
    __extends(AgChartsReact, _super);
    function AgChartsReact(props, state) {
        var _this = _super.call(this, props, state) || this;
        _this.props = props;
        _this.state = state;
        _this.chartRef = react_1.createRef();
        return _this;
    }
    AgChartsReact.prototype.render = function () {
        return react_1.createElement("div", {
            style: this.createStyleForDiv(),
            ref: this.chartRef
        });
    };
    AgChartsReact.prototype.createStyleForDiv = function () {
        return __assign({ height: "100%" }, this.props.containerStyle);
    };
    AgChartsReact.prototype.componentDidMount = function () {
        var options = this.applyContainerIfNotSet(this.props.options);
        this.chart = ag_charts_community_1.AgChart.create(options);
    };
    AgChartsReact.prototype.applyContainerIfNotSet = function (propsOptions) {
        if (propsOptions.container) {
            return propsOptions;
        }
        return __assign(__assign({}, propsOptions), { container: this.chartRef.current });
    };
    AgChartsReact.prototype.shouldComponentUpdate = function (nextProps) {
        this.processPropsChanges(this.props, nextProps);
        // we want full control of the dom, as ag-Charts doesn't use React internally,
        // so for performance reasons we tell React we don't need render called after
        // property changes.
        return false;
    };
    AgChartsReact.prototype.processPropsChanges = function (prevProps, nextProps) {
        ag_charts_community_1.AgChart.update(this.chart, this.applyContainerIfNotSet(nextProps.options));
    };
    AgChartsReact.prototype.componentWillUnmount = function () {
        if (this.chart) {
            this.chart.destroy();
        }
    };
    return AgChartsReact;
}(react_1.Component));
exports.AgChartsReact = AgChartsReact;
AgChartsReact.propTypes = {
    options: PropTypes.object
};
