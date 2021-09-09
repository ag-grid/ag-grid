import React, {Component} from "react";

export default class TotalValueRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            cellValue: TotalValueRenderer.getValueToDisplay(props)
        }
    }

    // update cellValue when the cell's props are updated
    static getDerivedStateFromProps(nextProps) {
        return {
            cellValue: TotalValueRenderer.getValueToDisplay(nextProps)
        };
    }

    buttonClicked() {
        alert(`${this.state.cellValue} medals won!`)
    }

    render() {
        return (
            <span>
              <span>{this.state.cellValue}</span>&nbsp;
              <button onClick={() => this.buttonClicked()}>Push For Total</button>
            </span>
        );
    }

    static getValueToDisplay(params) {
        return params.valueFormatted ? params.valueFormatted : params.value;
    }
};
