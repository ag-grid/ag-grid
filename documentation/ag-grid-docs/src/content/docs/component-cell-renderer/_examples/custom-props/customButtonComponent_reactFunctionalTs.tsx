import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

interface CustomButtonParams extends CustomCellRendererProps {
    onClick: () => void;
}

export default ({ onClick, data }: CustomButtonParams) => {
    return (
        <button className="btn-simple" onClick={onClick}>
            {data?.company ? `Launch ${data.company}!` : 'Launch!'}
        </button>
    );
};
