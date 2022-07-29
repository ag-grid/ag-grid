import React, {Component} from "react";

export default class MedalRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            cellValue: props.valueFormatted ? props.valueFormatted : props.value
        }
    }

    render() {
        return (
            <span>
                <span>{this.state.cellValue}</span>&nbsp;
                <button onClick={() => alert(`${this.state.cellValue} medals won!`)}>Push For Total</button>
            </span>
        );
    }
};
