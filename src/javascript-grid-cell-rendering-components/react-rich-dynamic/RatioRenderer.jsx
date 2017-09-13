import React, {Component} from "react";

export default class RatioRenderer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let agRatioStyle = {
            display: "block",
            overflow: "hidden",
            border: "1px solid #ccc",
            borderRadius: "6px",
            background: "#fff",
            height: 20
        };

        let svg = {
            width: "100%",
            height: "100%",
            pointerEvents: "none"
        };

        let topBar = {
            fill: "#ff9933"
        };

        let bottomBar = {
            fill: "#6699ff"
        };

        return (
            <ag-ratio style={agRatioStyle}>
                <svg style={svg} viewBox="0 0 300 100" preserveAspectRatio="none">
                    <rect x="0" y="0" width={this.props.value.top * 300} height="50" rx="4" ry="4" style={topBar}/>
                    <rect x="0" y="50" width={this.props.value.bottom * 300} height="50" rx="4" ry="4" style={bottomBar}/>
                </svg>
            </ag-ratio>
        );
    }
}