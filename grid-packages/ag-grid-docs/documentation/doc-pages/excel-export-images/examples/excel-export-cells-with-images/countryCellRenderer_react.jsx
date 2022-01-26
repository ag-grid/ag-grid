import React, {Component} from "react";

// simple cell renderer returns dummy buttons. in a real application, a component would probably
// be used with operations tied to the buttons. in this example, the cell renderer is just for
// display purposes.
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
