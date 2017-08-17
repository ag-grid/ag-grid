import React, {Component} from "react";

export default class ClickableRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            cell: {
                row: this.props.value,
                col: this.props.colDef.headerName
            }
        };

        this.clicked = this.clicked.bind(this);
    }

    clicked() {
        console.log("Child Cell Clicked: " + JSON.stringify(this.state.cell));
    }

    render() {
          return (
            <button style={{height: 21}} onClick={this.clicked} >Click Me</button>
        );
    }
}