// ag-charts-react v7.0.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgChartsReact = void 0;
const react_1 = require("react");
const PropTypes = require("prop-types");
const ag_charts_community_1 = require("ag-charts-community");
class AgChartsReact extends react_1.Component {
    constructor(props, state) {
        super(props, state);
        this.props = props;
        this.state = state;
        this.chartRef = react_1.createRef();
    }
    render() {
        return react_1.createElement("div", {
            style: this.createStyleForDiv(),
            ref: this.chartRef
        });
    }
    createStyleForDiv() {
        return Object.assign({ height: "100%" }, this.props.containerStyle);
    }
    componentDidMount() {
        const options = this.applyContainerIfNotSet(this.props.options);
        this.chart = ag_charts_community_1.AgChart.create(options);
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
        ag_charts_community_1.AgChart.update(this.chart, this.applyContainerIfNotSet(nextProps.options));
    }
    componentWillUnmount() {
        if (this.chart) {
            this.chart.destroy();
        }
    }
}
exports.AgChartsReact = AgChartsReact;
AgChartsReact.propTypes = {
    options: PropTypes.object
};
