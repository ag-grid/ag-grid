import React, {Component, createRef} from 'react';

export default class DoublingEditor extends Component {
    constructor(props) {
        super(props);

        this.inputRef = createRef();

        this.state = {
            value: parseInt(props.value)
        };
    }

    componentDidMount() {
        this.inputRef.current.focus();
    }

    /* Component Editor Lifecycle methods */

    // the final value to send to the grid, on completion of editing
    getValue() {
        // this simple editor doubles any value entered into the input
        return this.state.value * 2;
    }

    // Gets called once before editing starts, to give editor a chance to
    // cancel the editing before it even starts.
    isCancelBeforeStart() {
        return false;
    }

    // Gets called once when editing is finished (eg if Enter is pressed).
    // If you return true, then the result of the edit will be ignored.
    isCancelAfterEnd() {
        // our editor will reject any value greater than 1000
        return this.state.value > 1000;
    }

    render() {
        return (
            <input ref={this.inputRef}
                   value={this.state.value}
                   onChange={event => this.setState({value: event.target.value})}
                   type="number"
                   className="doubling-input"
            />
        );
    }
}
