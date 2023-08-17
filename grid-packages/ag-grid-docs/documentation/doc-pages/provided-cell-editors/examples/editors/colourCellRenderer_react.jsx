import React, {Component} from "react";

export default class ColourCellRenderer extends Component {
    render() {
        return (
            <div>
                <span style={{
                    borderLeft: '10px solid ' + this.props.value,
                    paddingRight: '5px'
                }}></span>
                {this.props.value}
            </div>
        )
    }
};
