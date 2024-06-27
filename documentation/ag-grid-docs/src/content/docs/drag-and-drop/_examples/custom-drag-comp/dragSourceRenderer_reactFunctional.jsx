import React from 'react';

export default (props) => {
    const onDragStart = (dragEvent) => {
        dragEvent.dataTransfer.setData('text/plain', 'Dragged item with ID: ' + props.node.data.id);
    };

    return (
        <div draggable="true" onDragStart={onDragStart}>
            Drag Me!
        </div>
    );
};
