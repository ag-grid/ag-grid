import React, {Component} from 'react';

export default class CustomTooltip extends Component {
    getReactContainerClasses() {
        return ['custom-tooltip'];
    }

    render() {
        const data = this.props.api.getDisplayedRowAtIndex(this.props.rowIndex).data;
        return (
            <div className="custom-tooltip" style={{backgroundColor: this.props.color || 'white'}}>
                <p><span>{data.athlete}</span></p>
                <p><span>Country: </span> {data.country}</p>
                <p><span>Total: </span> {data.total}</p>
            </div>
        );
    }
}
