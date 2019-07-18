import React, {Component} from 'react';

export default class CustomTooltip extends Component {
    componentDidMount() {
        this.props.reactContainer.className = 'custom-tooltip';
    }

    render() {
        var props = this.props,
            isHeader = props.rowIndex === undefined,
            isGroupedHeader = isHeader && !!props.colDef.children,
            valueToDisplay = props.value.value ? props.value.value : '- Missing -';

        return isHeader ? 
            (
                <div className="custom-tooltip">
                    <p>Group Name: {props.value}</p>
                    {isGroupedHeader ? <hr /> : null}
                    { isGroupedHeader ?
                        props.colDef.children.map(function(header, idx) {
                            return (
                                <p>Child {idx + 1} - { header.headerName }</p>
                            );
                        })
                        : null
                    }
                </div>)
            :
            (
                <div className="custom-tooltip">
                    <p><span>Athletes Name:</span></p>
                    <p><span>{valueToDisplay}</span></p>
                </div>
            );
    }
}
