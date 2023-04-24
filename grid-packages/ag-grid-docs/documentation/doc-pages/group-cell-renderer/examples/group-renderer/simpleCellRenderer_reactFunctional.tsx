import React from 'react';
import { ICellRendererParams } from '@ag-grid-community/core';

export default (props: ICellRendererParams) => <span style={{ backgroundColor: props.node.group ? 'coral' : 'lightgreen', padding: 2 }}>{props.value}</span>
