import React, {Component} from "react";

export default class MedalCellRenderer extends Component {
    render() {
        return <span>{new Array(this.props.value).fill('#').join('')}</span>;
    }
};
