import React, {Component} from "react";

export default class MedalCellRenderer extends Component {
    render() {
        return <span>{new Array(parseInt(this.props.value, 10)).fill('#').join('')}</span>;
    }
};
