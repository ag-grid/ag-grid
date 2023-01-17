import React, { Component, createRef } from "react";

const KEY_F2 = 'F2';
const KEY_ENTER = 'Enter';
const KEY_TAB = 'Tab';

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
        this.setCaret();
    }

    render() {
        return (
            <input ref={this.inputRef}
                value={this.state.value}
                onKeyDown={this.onKeyDown}
                onChange={this.handleChange}
                className='numeric-input'
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
        let highlightAllOnFocus = true;

        if (props.charPress) {
            // if a letter was pressed, we start with the letter
            startValue = props.charPress;
            highlightAllOnFocus = false;
        } else {
            // otherwise we start with the current value
            startValue = props.value;
            if (props.eventKey === KEY_F2) {
                highlightAllOnFocus = false;
            }
        }

        return {
            value: startValue,
            highlightAllOnFocus
        };
    }

    onKeyDown(event) {
        if (this.isLeftOrRight(event)) {
            event.stopPropagation();
            return;
        }

        if (!this.finishedEditingPressed(event) && !this.isKeyPressedNumeric(event)) {
            if (event.preventDefault) event.preventDefault();
        }
    }

    isLeftOrRight(event) {
        return ['ArrowLeft', 'ArrowRight'].indexOf(event.key) > -1;
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    isCharNumeric(charStr) {
        return !!/\d/.test(charStr);
    }

    isKeyPressedNumeric(event) {
        const charStr = event.key;
        return this.isCharNumeric(charStr);
    }

    finishedEditingPressed(event) {
        const key = event.key;
        return key === KEY_ENTER || key === KEY_TAB;
    }

    setCaret() {
        // https://github.com/facebook/react/issues/7835#issuecomment-395504863
        setTimeout(() => {
            const currentInput = this.inputRef.current;
            currentInput.focus();
            if (this.state.highlightAllOnFocus) {
                currentInput.select();

                this.setState({
                    highlightAllOnFocus: false
                });
            } else {
                // when we started editing, we want the caret at the end, not the start.
                // this comes into play in two scenarios: 
                //   a) when user hits F2 
                //   b) when user hits a printable character
                const length = currentInput.value ? currentInput.value.length : 0;
                if (length > 0) {
                    currentInput.setSelectionRange(length, length);
                }
            }
        });
    }
}
