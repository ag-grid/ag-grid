import React, {Component} from "react";

export default class FullWidthCellRenderer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            cssClass: props.pinned ? 'example-full-width-pinned' :
                'example-full-width-row',
            message: props.pinned ? `Pinned full width on ${props.pinned} - index ${props.rowIndex}` :
                `Non pinned full width row at index${props.rowIndex}`
        }
    }

    render() {
        return (
            <div className={this.state.cssClass}>
                <button onClick={() => alert('button clicked')}>Click</button>
                {this.state.message}
            </div>)
    }
};
