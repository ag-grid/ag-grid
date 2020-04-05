import React, {Component} from 'react';

export default class CustomTooltip extends Component {
    getReactContainerClasses() {
        return ['custom-tooltip'];
    }

    render() {
        const data = this.props.api.getDisplayedRowAtIndex(this.props.rowIndex).data;
        return (
            <div className={'panel panel-' + (this.props.type || 'primary') }>
                <div className="panel-heading">
                    <h3 className="panel-title">{data.country}</h3>
                </div>
                <div className="panel-body">
                    <h4 style={{whiteSpace: 'nowrap'}}>{data.athlete}</h4>
                    <p>Total: {data.total}</p>
                </div>
            </div>
        );
    }
}
