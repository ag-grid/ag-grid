import React, {Component, createRef, Fragment} from "react";

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
        if (!parentModel) {
            this.inputRef.current.value = '';
            this.setState({currentValue: null});
        } else {
            this.inputRef.current.value = parentModel.filter + '';
            this.setState({currentValue: parentModel.filter});
        }
    }

    onInputBoxChanged = input => {
        if (input.target.value === '') {
            // Remove the filter
            this.props.parentFilterInstance(instance => {
                instance.onFloatingFilterChanged(null, null);
            });
            return;
        }

        this.setState({currentValue: Number(input.target.value)});
        this.props.parentFilterInstance(instance => {
            instance.onFloatingFilterChanged('greaterThan', input.target.value);
        });
    }

    render() {
        const style = {
            color: this.props.color,
            width: "30px"
        };

        return (
            <Fragment>
                &gt; <input ref={this.inputRef} style={style} type="number" min="0" onInput={this.onInputBoxChanged}/>
            </Fragment>
        );
    }
}
