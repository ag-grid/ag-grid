import React, {Component} from "react";

export default class MedalRenderer extends Component {
    constructor(props) {
        super(props);

        this.country = this.props.node.key;
        this.gold = this.props.data.gold;
        this.silver = this.props.data.silver;
        this.bronze = this.props.data.bronze;
    }

    render() {
        return (
            <span>{this.country} Gold: {this.gold}, Silver: {this.silver}, Bronze: {this.bronze}</span>
        );
    }
};
