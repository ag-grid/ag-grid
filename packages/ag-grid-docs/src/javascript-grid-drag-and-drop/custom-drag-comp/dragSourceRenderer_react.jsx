import React, {Component} from "react";

export default class DragSourceRenderer extends Component {
    constructor(props) {
        super(props);
    }

    onDragStart = (dragEvent) => {
        dragEvent.dataTransfer.setData('text/plain', "Dragged item with ID: " + this.props.node.data.id);
    };

    render() {
        return (
            <div draggable="true" onDragStart={this.onDragStart}>Drag Me!</div>
        );
    }
};
