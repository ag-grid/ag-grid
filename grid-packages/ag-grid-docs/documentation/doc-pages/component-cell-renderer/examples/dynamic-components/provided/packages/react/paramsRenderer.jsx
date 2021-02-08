import React, {Component} from "react";

export default class ParamsRenderer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <span>Field: {this.props.colDef.field}, Value: {this.props.value}</span>
        );
    }
};
