import React, {Component} from "react";

// simple cell renderer returns dummy buttons. in a real application, a component would probably
// be used with operations tied to the buttons. in this example, the cell renderer is just for
// display purposes.
export default class ControlsComponent extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { data, context } = this.props;
        return (
            <div>
                <img alt={data.country} src={context.base64flags[context.countryCodes[data.country]]} /> {data.country}
            </div>
        );
    }
};
