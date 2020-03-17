import React, {Component} from 'react';

export default class GenderCellRenderer extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const image = this.props.value === 'Male' ? 'male.png' : 'female.png';
        const imageSource = `../images/${image}`;
        return (
            <span>
                <img src={imageSource}/>{this.props.value}
            </span>
        );
    }
}

