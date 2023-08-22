import React, {Component} from "react";

export default class ColourCellRenderer extends Component {
    render() {
        return (
            this.props.value != null &&
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span style={{
                    borderLeft: '10px solid ' + this.props.value,
                    paddingRight: '5px'
                }}></span>
                {this.props.value}
            </div>
        )
    }
};
