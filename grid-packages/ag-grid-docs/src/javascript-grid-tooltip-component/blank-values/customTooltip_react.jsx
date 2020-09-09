import React, { Component } from 'react';

export default class CustomTooltip extends Component {
    getReactContainerClasses() {
        return ['custom-tooltip'];
    }

    render() {
        const valueToDisplay = this.props.value.value ? this.props.value.value : '- Missing -';
        return (
            <div className="custom-tooltip">
                <p><span>Athlete's Name:</span></p>
                <p><span>{valueToDisplay}</span></p>
            </div>
        );
    }
}
