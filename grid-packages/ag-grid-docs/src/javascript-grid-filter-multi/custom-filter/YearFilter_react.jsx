import React, { Component } from 'react';

export default class YearFilter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isActive: false,
        };
    }

    toggleFilter = isActive => {
        this.setState({ isActive }, () => this.props.filterChangedCallback());
    };

    doesFilterPass = params => {
        return params.data.year > 2004;
    };

    isFilterActive = () => {
        return this.state.isActive;
    };

    getModel = () => {
        return this.isFilterActive() || null;
    };

    setModel = model => {
        this.toggleFilter(!!model);
    };

    onFloatingFilterChanged = value => {
        this.setModel(value);
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
