import React, { Component, createRef, Fragment } from "react";

export default class NumberFloatingFilterComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentValue: null
        }

        this.inputRef = createRef();
    }

    onParentModelChanged(parentModel) {
        // When the filter is empty we will receive a null value here
        if (parentModel == null) {
            this.setState({ currentValue: null }, () => this.inputRef.current.value = this.state.currentValue);
        } else {
            this.setState({ currentValue: parentModel }, () => this.inputRef.current.value = this.state.currentValue);
        }
    }

    onInputBoxChanged = (event) => {
        this.setState({ currentValue: event.target.value }, () => {
            if (!this.state.currentValue) {
                // Remove the filter
                this.props.parentFilterInstance((instance) => {
                    instance.myMethodForTakingValueFromFloatingFilter(null);
                });
                return;
            }

            this.props.parentFilterInstance((instance) => {
                instance.myMethodForTakingValueFromFloatingFilter(this.state.currentValue);
            });
        });
    }

    render() {
        return (
            <Fragment>
                &gt; <input ref={this.inputRef} style={{ width: "30px" }} type="number" min="0" onInput={this.onInputBoxChanged} />
            </Fragment>
        );
    }
}
