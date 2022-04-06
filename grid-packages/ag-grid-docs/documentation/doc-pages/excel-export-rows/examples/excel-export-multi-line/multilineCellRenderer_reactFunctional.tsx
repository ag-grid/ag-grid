import React from 'react';
import { ICellRendererParams } from '@ag-grid-community/core';

export default (props: ICellRendererParams) => (
    <div dangerouslySetInnerHTML={{ __html: props.value.replace('\n', '<br/>') }}></div>
)
