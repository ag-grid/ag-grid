import React from 'react';
import { CustomCellRendererProps } from '@ag-grid-community/react';

export default (props: CustomCellRendererProps) => (
    <div dangerouslySetInnerHTML={{ __html: props.value.replace('\n', '<br/>') }}></div>
)
