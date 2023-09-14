import React, {Component} from "react";

export default class MedalCellRenderer extends Component {
    medalUserFunction() {
        console.log(`user function called for medal column: row = ${this.props.node.rowIndex}, column = ${this.props.column.getId()}`);
    }

    render() {
        return <span>{new Array(this.props.value).fill('#').join('')}</span>;
    }
};
