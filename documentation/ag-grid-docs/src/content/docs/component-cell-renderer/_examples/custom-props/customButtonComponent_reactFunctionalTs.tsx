import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

interface CustomButtonParams extends CustomCellRendererProps {
    onClick: () => void;
}

export default (params: CustomButtonParams) => {
    return <button onClick={params.onClick}>Launch!</button>;
};
