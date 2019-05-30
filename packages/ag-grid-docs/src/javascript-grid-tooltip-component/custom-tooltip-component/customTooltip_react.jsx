import React, {Component} from 'react';

export default class CustomTooltip extends Component {
    componentDidMount() {
        this.props.reactContainer.className = 'custom-tooltip';
    }

    render() {
        var data = this.props.api.getDisplayedRowAtIndex(this.props.rowIndex).data;
        return (
            <div className="custom-tooltip" style={{backgroundColor: this.props.color || 'white'}}>
                <p><span>{data.athlete}</span></p>
                <p><span>Country: </span> {data.country}</p>
                <p><span>Total: </span> {data.total}</p>
            </div>
        );
    }
}
