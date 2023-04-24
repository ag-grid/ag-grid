import React, {Component} from "react";

export default class MedalRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            country: props.valueFormatted ? props.valueFormatted : props.value,
            total: props.data.total
        }
    }

    render() {
        return (
            <span className="total-value-renderer">
                <span>{this.state.country}</span>
                <button onClick={() => alert(`${this.state.total} medals won!`)}>Push For Total</button>
            </span>
        );
    }
};
