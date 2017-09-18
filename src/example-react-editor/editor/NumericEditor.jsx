import React, {Component} from "react";

export default class MoodEditor extends Component {
    constructor(props) {
        super(props);

        this.cancelBeforeStart = this.props.charPress && ('1234567890'.indexOf(this.props.charPress) < 0);

        let value = this.props.value;
        if (!this.cancelBeforeStart && this.props.charPress) {
            value = value + this.props.charPress;
        }
        this.state = {
            value
        };

        this.onKeyDown = this.onKeyDown.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.refs.input.addEventListener('keydown', this.onKeyDown);
        this.focus();
    }

    componentDidUpdate() {
        this.focus();
    }

    componentWillUnmount() {
        this.refs.input.removeEventListener('keydown', this.onKeyDown);
    }

    focus() {
        setTimeout(() => {
            this.refs.input.focus();
            this.refs.input.setSelectionRange(this.state.value.length, this.state.value.length);

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
        if (this.isLeftOrRight(event)) {
            event.stopPropagation();
            return;
        }

        if (!this.isKeyPressedNumeric(event)) {
            if (event.preventDefault) event.preventDefault();
        }
    }

    isLeftOrRight(event) {
        return [37, 39].indexOf(event.keyCode) > -1;
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
                   onChange={this.handleChange}
                   style={{width: "100%"}}
            />
        );
    }
}