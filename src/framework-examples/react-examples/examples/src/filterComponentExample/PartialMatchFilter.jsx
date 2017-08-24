import React, {Component} from "react";
import ReactDOM from "react-dom";

export default class PartialMatchFilter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            text: ''
        }
        this.valueGetter = this.props.valueGetter;

        this.onChange = this.onChange.bind(this);
    }

    isFilterActive() {
        return this.state.text !== null && this.state.text !== undefined && this.state.text !== '';
    }

    doesFilterPass(params) {
        return this.state.text.toLowerCase()
            .split(" ")
            .every((filterWord) => {
                return this.valueGetter(params.node).toString().toLowerCase().indexOf(filterWord) >= 0;
            });
    }

    getModel() {
        return {value: this.state.text};
    }

    setModel(model) {
        this.state.text = model ? model.value : '';
    }

    afterGuiAttached(params) {
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

    componentMethod(message) {
        alert(`Alert from PartialMatchFilterComponent ${message}`);
    }

    onChange(event) {
        let newValue = event.target.value;
        if (this.state.text !== newValue) {
            this.setState({
                text: newValue
            }, () => {
                this.props.filterChangedCallback();
            });

        }
    }

    render() {
        return (
            <span>Filter: <input style={{height: "20px"}} ref="input" value={this.state.text} onChange={this.onChange}/></span>
        );
    }
};
