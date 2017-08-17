import React, {Component} from "react";

export default class NameAndAgeRenderer extends Component {
    constructor(props) {
        super(props);

        this.values = `Name: ${this.props.data.name}, Age: ${this.props.data.age}`;
    }

    render() {
        return (
            <span>Full Width Column! { this.values }</span>
        );
    }
};
