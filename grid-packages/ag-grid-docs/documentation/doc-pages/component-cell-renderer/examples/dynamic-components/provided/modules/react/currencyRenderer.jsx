import React, {Component} from "react";

export default class CurrencyRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        }
    }

    formatValueToCurrency(currency, value) {
        return `${currency}${value.toFixed(2)}`
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.value !== this.state.value) {
            this.setState({
                value: this.props.value
            })
        }
    }

    render() {
        return (
            <span>{this.formatValueToCurrency('EUR', this.state.value)}</span>
        );
    }
};
