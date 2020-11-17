import React, {Component} from 'react';

export default class CustomPinnedRowRenderer extends Component {
    render() {
        return (
            <span style={this.props.style}>{this.props.value}</span>
        );
    }
};
