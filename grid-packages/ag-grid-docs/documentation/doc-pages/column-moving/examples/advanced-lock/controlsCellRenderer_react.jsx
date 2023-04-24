import React, {Component} from "react";

// simple cell renderer returns dummy buttons. in a real application, a component would probably
// be used with operations tied to the buttons. in this example, the cell renderer is just for
// display purposes.
export default class ControlsComponent extends Component {

    render() {
        return (
            <React.Fragment>
                <button>A</button>
                <button>B</button>
                <button>C</button>
            </React.Fragment>
        );
    }
};
