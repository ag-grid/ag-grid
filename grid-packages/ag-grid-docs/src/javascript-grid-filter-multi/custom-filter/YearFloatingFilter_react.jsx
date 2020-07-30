import React, { Component } from 'react';

export default class YearFloatingFilter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isFilterActive: false,
        };
    }

    toggleFilter = isFilterActive => {
        this.setState({ isFilterActive });
        this.props.parentFilterInstance(instance => instance.onFloatingFilterChanged(isFilterActive));
    };

    onParentModelChanged = model => {
        this.setState({ isFilterActive: !!model });
    };

    render() {
        return (
            <div class="year-filter">
                <label>
                    <input type="radio" checked={!this.state.isFilterActive} onChange={() => this.toggleFilter(false)} /> All
                </label>
                <label>
                    <input type="radio" checked={this.state.isFilterActive} onChange={() => this.toggleFilter(true)} /> After 2004
                </label>
            </div>
        );
    }
}
