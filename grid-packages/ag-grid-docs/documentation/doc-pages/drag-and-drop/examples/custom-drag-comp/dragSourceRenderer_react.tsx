import React, { Component } from "react";
import { ICellRendererParams } from '@ag-grid-community/core';

export default class DragSourceRenderer extends Component<ICellRendererParams> {
    constructor(props: ICellRendererParams) {
        super(props);
    }

    onDragStart = (dragEvent: any) => {
        var userAgent = window.navigator.userAgent;
        dragEvent.dataTransfer.setData('text/plain', 'Dragged item with ID: ' + this.props.node.data.id);
    };

    render() {
        return (
            <div draggable="true" onDragStart={this.onDragStart}>Drag Me!</div>
        );
    }
};
