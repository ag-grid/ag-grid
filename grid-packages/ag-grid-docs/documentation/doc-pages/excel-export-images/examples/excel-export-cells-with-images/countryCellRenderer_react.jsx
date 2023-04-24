import React, {Component} from "react";

export default class ControlsComponent extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <React.Fragment>
                <img alt={this.props.data.country} src={this.props.context.base64flags[this.props.context.countryCodes[this.props.data.country]]} />
            </React.Fragment>
        );
    }
};
