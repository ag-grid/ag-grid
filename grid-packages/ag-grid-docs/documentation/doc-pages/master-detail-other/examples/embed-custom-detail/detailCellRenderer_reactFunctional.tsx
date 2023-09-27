import React from 'react';
import { ColumnPinnedType, ICellRendererParams } from '@ag-grid-community/core';

export default function DetailCellRenderer (props: ICellRendererParams) {
      
    return (
      <h1 className="custom-detail" style={{ padding: '20px' }}>
        {props.pinned ?? 'center'}
      </h1>
    );
  
}