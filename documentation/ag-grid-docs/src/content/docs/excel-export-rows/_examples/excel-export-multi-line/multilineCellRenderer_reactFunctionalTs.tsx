import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (props: CustomCellRendererProps) => (
    <div dangerouslySetInnerHTML={{ __html: props.value.replace('\n', '<br/>') }}></div>
);
