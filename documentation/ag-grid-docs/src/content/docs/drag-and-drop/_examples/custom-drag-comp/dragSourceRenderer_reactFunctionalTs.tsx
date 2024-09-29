import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (props: CustomCellRendererProps) => {
    const onDragStart = (dragEvent: any) => {
        dragEvent.dataTransfer.setData('text/plain', 'Dragged item with ID: ' + props.node.data.id);
    };

    return (
        <div draggable="true" onDragStart={onDragStart}>
            Drag Me!
        </div>
    );
};
