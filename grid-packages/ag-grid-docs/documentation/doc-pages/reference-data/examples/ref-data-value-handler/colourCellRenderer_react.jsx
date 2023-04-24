import React, {Component} from "react";

export default class ColourCellRenderer extends Component {

    constructor(props) {
        super(props);
    }

    removeSpaces(str) {
        return str ? str.replace(/\s/g, '') : str
    }

    render() {
        if (this.props.value === '(Select All)') {
            return this.props.value
        }

        return (
            <span style={{color: this.removeSpaces(this.props.valueFormatted)}}>{this.props.valueFormatted}</span>
        )
    }
};
