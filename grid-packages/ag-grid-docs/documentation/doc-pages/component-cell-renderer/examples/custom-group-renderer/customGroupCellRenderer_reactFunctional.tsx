import React, { useState, useEffect, useCallback } from 'react';
import { ICellRendererParams, RowEvent } from '@ag-grid-community/core';

export default (props: ICellRendererParams) => {
    const { node, value } = props;
    const [expanded, setExpanded] = useState(node.expanded);
  
    useEffect(() => {
      const expandListener = (event: RowEvent) => setExpanded(event.node.expanded);
  
      node.addEventListener('expandedChanged', expandListener);
  
      return () => {
        node.removeEventListener('expandedChanged', expandListener);
      }
    }, []);
  
    const onClick = useCallback(() => node.setExpanded(!node.expanded), [node]);
  
    return (
      <div
        style={{
          paddingLeft: `${node.level * 15}px`,
        }}
      >
        {
          node.group && (
            <div
              style={{
                cursor: 'pointer',
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                display: 'inline-block'
              }}
              onClick={onClick}
            >
              &rarr;
            </div>
          )
        }
        &nbsp;
        {value}
      </div>
    );
  }
