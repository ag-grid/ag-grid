import React, {Component} from "react";

export default class FullWidthCellRenderer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            cssClass: props.node.rowPinned ? 'example-full-width-pinned-row' :
                'example-full-width-row',
            message: props.node.rowPinned ? `Pinned full width row at index ${props.rowIndex}` :
                `Normal full width row at index${props.rowIndex}`
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
