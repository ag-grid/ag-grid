import React, {Component} from "react";

export default class CurrencyRenderer extends Component {
    constructor(props) {
        super(props);
    }

    formatValueToCurrency(currency, value) {
        return `${currency}${value}`
    }

    render() {
        return (
            <span>{this.formatValueToCurrency('EUR', this.props.value)}</span>
        );
    }
};
