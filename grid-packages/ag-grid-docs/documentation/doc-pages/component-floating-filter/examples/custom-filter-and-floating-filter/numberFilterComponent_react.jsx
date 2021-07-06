import React, {Component, createRef} from "react";

export default class NumberFilterComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            filterText: null
        }

        this.inputRef = createRef();
    }

    doesFilterPass(params) {
        const value = this.props.valueGetter(params);

        if (this.isFilterActive()) {
            if (!value) return false;
            return Number(value) > Number(this.state.filterText);
        }
    }

    isFilterActive() {
        return this.state.filterText !== null &&
            this.state.filterText !== undefined &&
            this.state.filterText !== '' &&
            this.isNumeric(this.state.filterText);
    }

    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    getModel() {
        return this.isFilterActive() ? Number(this.state.filterText) : null;
    }

    setModel(model) {
        this.setState({filterText: model}, this.props.filterChangedCallback)
    }

    onInputBoxChanged = (event) => {
        this.setState({filterText: event.target.value}, this.props.filterChangedCallback)
    }

    myMethodForTakingValueFromFloatingFilter(value) {
        this.setState({filterText: value}, () => {
            this.inputRef.current.value = this.state.filterText;
            this.props.filterChangedCallback()
        });
    }

    render() {
        return (
            <div style={{padding: "4px"}}>
                <div style={{fontWeight: "bold"}}>Greater than:</div>
                <div>
                    <input ref={this.inputRef} style={{margin: "4px 0 4px 0"}} type="number" onInput={this.onInputBoxChanged} placeholder="Number of medals..."/>
                </div>
            </div>
        );
    }
}
