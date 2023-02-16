// ag-charts-react v7.1.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgChartsReact = void 0;
const react_1 = require("react");
const PropTypes = require("prop-types");
const ag_charts_community_1 = require("ag-charts-community");
class AgChartsReact extends react_1.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.chartRef = react_1.createRef();
    }
    render() {
        return react_1.createElement("div", {
            style: this.createStyleForDiv(),
            ref: this.chartRef
        });
    }
    createStyleForDiv() {
        var _a;
        return Object.assign({ height: "100%" }, ((_a = this.props.containerStyle) !== null && _a !== void 0 ? _a : {}));
    }
    componentDidMount() {
        const options = this.applyContainerIfNotSet(this.props.options);
        const chart = ag_charts_community_1.AgChart.create(options);
        this.chart = chart;
        chart.chart.waitForUpdate()
            .then(() => { var _a, _b; return (_b = (_a = this.props).onChartReady) === null || _b === void 0 ? void 0 : _b.call(_a, chart); });
    }
    applyContainerIfNotSet(propsOptions) {
        if (propsOptions.container) {
            return propsOptions;
        }
        return Object.assign(Object.assign({}, propsOptions), { container: this.chartRef.current });
    }
    shouldComponentUpdate(nextProps) {
        this.processPropsChanges(this.props, nextProps);
        // we want full control of the dom, as AG Charts doesn't use React internally,
        // so for performance reasons we tell React we don't need render called after
        // property changes.
        return false;
    }
    processPropsChanges(prevProps, nextProps) {
        if (this.chart) {
            ag_charts_community_1.AgChart.update(this.chart, this.applyContainerIfNotSet(nextProps.options));
        }
    }
    componentWillUnmount() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = undefined;
        }
    }
}
exports.AgChartsReact = AgChartsReact;
AgChartsReact.propTypes = {
    options: PropTypes.object
};
