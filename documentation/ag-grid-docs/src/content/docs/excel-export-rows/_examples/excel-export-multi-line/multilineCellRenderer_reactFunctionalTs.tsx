import { CustomCellRendererProps } from '@ag-grid-community/react';
import React from 'react';

export default (props: CustomCellRendererProps) => (
    <div dangerouslySetInnerHTML={{ __html: props.value.replace('\n', '<br/>') }}></div>
);
