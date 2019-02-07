import React, {Component} from "react";

export default class CountStatusBarComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            count: 10
        };

        setTimeout(() => {
            this.setState({
                count: this.props.api.getModel().rowsToDisplay.length
            });
        });
    }

    render() {
        return (
            <div className="ag-name-value">
                <span className="component">Row Count Component&nbsp;</span>
                <span className="ag-name-value-value">{this.state.count}</span>
            </div>
        );
    }
};
