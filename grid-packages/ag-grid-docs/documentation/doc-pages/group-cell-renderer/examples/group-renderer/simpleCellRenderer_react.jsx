import React, {Component} from "react";

export default class SimpleCellRenderer extends Component {
    render() {
        return (
            <span style={{backgroundColor: this.props.node.group ? 'coral' : 'lightgreen', padding: 2}}>{this.props.value}</span>
        );
    }
};
