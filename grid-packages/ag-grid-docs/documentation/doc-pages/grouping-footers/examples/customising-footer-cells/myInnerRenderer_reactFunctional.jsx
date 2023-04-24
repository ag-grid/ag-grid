import React from 'react';

export default props => {

    const footer = props.node.footer;
    const isRootLevel = props.node.level === -1;
    const value = props.value;

    if (footer) {
        if (isRootLevel) {
            return <span style={{color: 'navy', fontWeight: 'bold'}}>Grand Total</span>;
        } else {
            return <span style={{color: 'navy'}}>Sub Total {value}</span>;
        }
    } else {
        return <span>{value}</span>;
    }
}
