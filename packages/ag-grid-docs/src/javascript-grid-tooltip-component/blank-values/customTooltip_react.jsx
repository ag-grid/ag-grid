import React, {Component} from 'react';

export default class CustomTooltip extends Component {
    componentDidMount() {
        this.props.reactContainer.className = 'custom-tooltip';
    }

    render() {

        var valueToDisplay = this.props.value.value ? this.props.value.value : '- Missing -';

        return (
            <div className="custom-tooltip">
                <p><span>Athletes Name:</span></p>
                <p><span>{valueToDisplay}</span></p>
            </div>
        );
    }
}
