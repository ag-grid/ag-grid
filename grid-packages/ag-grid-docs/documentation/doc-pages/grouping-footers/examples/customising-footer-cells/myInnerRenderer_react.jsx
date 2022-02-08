import React, {Component} from "react";

export default class MyInnerRenderer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const footer = this.props.node.footer;
        const isRootLevel = this.props.node.level === -1;
        const value = this.props.value;

        if (footer) {
            if (isRootLevel) {
                return <span style={{color: 'navy', fontWeight: 'bold'}}>Grand Total</span>;
            } else {
                return <span style={{color: 'navy'}}>Sub Total ${value}</span>;
            }
        } else {
            return <span>{value}</span>;
        }
    }
};
