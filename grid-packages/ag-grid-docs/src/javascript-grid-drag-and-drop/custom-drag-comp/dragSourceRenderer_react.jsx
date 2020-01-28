import React, {Component} from "react";

export default class DragSourceRenderer extends Component {
    constructor(props) {
        super(props);
    }

    onDragStart = (dragEvent) => {
        var userAgent = window.navigator.userAgent;
        var isIE = userAgent.indexOf('Trident/') >= 0;
        dragEvent.dataTransfer.setData(isIE ? 'text' : 'text/plain', 'Dragged item with ID: ' + this.props.node.data.id);
    };

    render() {
        return (
            <div draggable="true" onDragStart={this.onDragStart}>Drag Me!</div>
        );
    }
};
