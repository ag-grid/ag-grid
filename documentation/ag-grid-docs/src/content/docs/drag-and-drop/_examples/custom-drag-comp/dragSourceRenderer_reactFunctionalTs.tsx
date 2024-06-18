import React from 'react';
import { CustomCellRendererProps } from '@ag-grid-community/react';

export default (props: CustomCellRendererProps) => {
  const onDragStart = (dragEvent: any) => {
    dragEvent.dataTransfer.setData(
      'text/plain',
      'Dragged item with ID: ' + props.node.data.id
    );
  };

  return (
    <div draggable="true" onDragStart={onDragStart}>
      Drag Me!
    </div>
  );
}
