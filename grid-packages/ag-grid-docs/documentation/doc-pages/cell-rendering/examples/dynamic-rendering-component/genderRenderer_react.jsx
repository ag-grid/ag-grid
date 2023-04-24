import React, { Component } from 'react';

export default class GenderRenderer extends Component {
    render() {
        const image = this.props.value === 'Male' ? 'male.png' : 'female.png';
        const imageSource = `https://www.ag-grid.com/example-assets/genders/${image}`;
        return (
            <span>
                <img src={imageSource} />{this.props.value}
            </span>
        );
    }
}

