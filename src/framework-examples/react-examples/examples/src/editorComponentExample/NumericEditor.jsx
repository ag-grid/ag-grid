import React, {Component} from "react";
import ReactDOM from "react-dom";

export default class MoodEditor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value
        };

        this.cancelBeforeStart = this.props.charPress && ('1234567890'.indexOf(this.props.charPress) < 0);

        this.onKeyDown = this.onKeyDown.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.focus();
    }

    componentDidUpdate() {
        this.focus();
    }

    focus() {
        setTimeout(() => {
            let container = ReactDOM.findDOMNode(this.refs.input);
            if (container) {
                container.focus();
            }
        })
    }

    getValue() {
        return this.state.value;
    }

    isCancelBeforeStart() {
        return this.cancelBeforeStart;
    }

    // will reject the number if it greater than 1,000,000
    // not very practical, but demonstrates the method.
    isCancelAfterEnd() {
        return this.state.value > 1000000;
    };

    onKeyDown(event) {
        if (!this.isKeyPressedNumeric(event)) {
            if (event.preventDefault) event.preventDefault();
        }
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    getCharCodeFromEvent(event) {
        event = event || window.event;
        return (typeof event.which === "undefined") ? event.keyCode : event.which;
    }

    isCharNumeric(charStr) {
        return !!/\d/.test(charStr);
    }

    isKeyPressedNumeric(event) {
        const charCode = this.getCharCodeFromEvent(event);
        const charStr = event.key ? event.key : String.fromCharCode(charCode);
        return this.isCharNumeric(charStr);
    }

    render() {
        return (
            <input ref="input"
                   value={this.state.value}
                   onKeyDown={this.onKeyDown}
                   onChange={this.handleChange}
            />
        );
    }
}