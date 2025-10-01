import React from 'react';

import type { ICellRendererParams } from 'ag-grid-community';

export default ({ data }: ICellRendererParams) => {
    return (
        <button onClick={() => console.log('Software Launched')}>
            {data?.company ? `Launch ${data.company}!` : 'Launch!'}
        </button>
    );
};
