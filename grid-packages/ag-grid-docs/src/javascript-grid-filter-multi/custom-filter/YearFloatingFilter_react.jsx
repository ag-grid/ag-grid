import React, { Component } from 'react';

export default class YearFloatingFilter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isActive: false,
        };
    }

    toggleFilter = isActive => {
        this.setState({ isActive });
        this.props.parentFilterInstance(instance => instance.onFloatingFilterChanged(isActive));
    };

    onParentModelChanged = model => {
        this.setState({ isActive: !!model });
    };

    render() {
        return (
            <div class="year-filter">
                <label>
                    <input type="radio" checked={!this.state.isActive} onChange={() => this.toggleFilter(false)} /> All
                </label>
                <label>
                    <input type="radio" checked={this.state.isActive} onChange={() => this.toggleFilter(true)} /> After 2004
                </label>
            </div>
        );
    }
}
