import React, { Component } from "react";
import { render } from "react-dom";
import { AgChartsReact } from "ag-charts-react";

class ChartExample extends Component {
    render() {
        const options = $OPTIONS$;

        return <AgChartsReact options={options} />;
    }
}

render(<ChartExample />, document.querySelector("#root"));
