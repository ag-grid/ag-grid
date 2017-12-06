import React, {Component} from "react";

export default class CurrencyRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        }
    }

    formatValueToCurrency(currency, value) {
        return `${currency}${value}`
    }

    // noinspection JSUnusedGlobalSymbols
    refresh(params) {
        if(params.value !== this.state.value) {
            this.setState({
                value: params.value.toFixed(2)
            })
        }
        return true;
    }

    render() {
        return (
            <span>{this.formatValueToCurrency('EUR', this.state.value)}</span>
        );
    }
};
