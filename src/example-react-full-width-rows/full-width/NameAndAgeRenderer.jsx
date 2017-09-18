import React, {Component} from "react";

export default class NameAndAgeRenderer extends Component {
    constructor(props) {
        super(props);

        this.values = `Name: ${this.props.data.name}, Age: ${this.props.data.age}`;
    }

    render() {
        let style = {
            border: "2px solid #22ff22",
            borderRadius: "5px",
            backgroundColor: "#bbffbb"
        };

        return (
            <div style={style}>Full Width Column! { this.values }</div>
        );
    }
};
