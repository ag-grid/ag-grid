import React, { Component } from 'react';

export default class DetailCellRenderer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            pinned: props.pinned
        }
    }

    render() {
        return (
            <h1 className="custom-detail" style={{ padding: '20px' }}>{this.state.pinned ? this.state.pinned : 'center'}</h1>
        );
    }
}
