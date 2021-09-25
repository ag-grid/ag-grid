import React, { Component, createRef } from "react";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;
const KEY_F2 = 113;
const KEY_ENTER = 13;
const KEY_TAB = 9;

export default class NumericEditor extends Component {
    constructor(props) {
        super(props);

        this.inputRef = createRef(null);

        this.cancelBeforeStart = this.props.charPress && ('1234567890'.indexOf(this.props.charPress) < 0);

        this.state = this.createInitialState(props);

        this.onKeyDown = this.onKeyDown.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.setCarot();
    }

    render() {
        return (
            <input ref={this.inputRef}
                value={this.state.value}
                onKeyDown={this.onKeyDown}
                onChange={this.handleChange}
            />
        );
    }

    /* Component Editor Lifecycle methods */
    // the final value to send to the grid, on completion of editing
    getValue() {
        return this.state.value;
    }

    // Gets called once before editing starts, to give editor a chance to
    // cancel the editing before it even starts.
    isCancelBeforeStart() {
        return this.cancelBeforeStart;
    }

    // Gets called once when editing is finished (eg if Enter is pressed).
    // If you return true, then the result of the edit will be ignored.
    isCancelAfterEnd() {
        // will reject the number if it greater than 1,000,000
        // not very practical, but demonstrates the method.
        return this.state.value > 1000000;
    };

    /* Utility methods */
    createInitialState(props) {
        let startValue;

        if (props.keyPress === KEY_BACKSPACE || props.keyPress === KEY_DELETE) {
            // if backspace or delete pressed, we clear the cell
            startValue = '';
        } else if (props.charPress) {
            // if a letter was pressed, we start with the letter
            startValue = props.charPress;
        } else {
            // otherwise we start with the current value
            startValue = props.value;
        }

        return {
            value: startValue
        };
    }

    onKeyDown(event) {
        if (this.isLeftOrRight(event) || this.deleteOrBackspace(event)) {
            event.stopPropagation();
            return;
        }

        if (!this.finishedEditingPressed(event) && !this.isKeyPressedNumeric(event)) {
            if (event.preventDefault) event.preventDefault();
        }
    }

    isLeftOrRight(event) {
        return [37, 39].indexOf(event.keyCode) > -1;
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
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

    deleteOrBackspace(event) {
        return [KEY_DELETE, KEY_BACKSPACE].indexOf(event.keyCode) > -1;
    }

    finishedEditingPressed(event) {
        const charCode = this.getCharCodeFromEvent(event);
        return charCode === KEY_ENTER || charCode === KEY_TAB;
    }

    setCarot() {
        // https://github.com/facebook/react/issues/7835#issuecomment-395504863
        setTimeout(() => {
            const currentInput = this.inputRef.current;
            currentInput.focus();
        });
    }
}
