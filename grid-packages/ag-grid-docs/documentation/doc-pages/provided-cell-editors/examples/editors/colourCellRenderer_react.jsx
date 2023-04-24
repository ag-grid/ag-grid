import React, {Component} from "react";

export default class ColourCellRenderer extends Component {
    render() {
        return (
            <span style={{
                    borderLeft: '10px solid ' + this.props.value,
                    paddingLeft: '5px'
                }}>{this.props.value}</span>
        )
    }
};
