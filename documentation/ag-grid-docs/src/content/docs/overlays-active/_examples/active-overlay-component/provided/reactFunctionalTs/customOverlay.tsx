import React from 'react';

import type { CustomOverlayProps } from 'ag-grid-react';

export interface CustomParams {
    count: number;
}

export const CustomOverlay = (props: CustomOverlayProps & CustomParams) => {
    return <div className="my-custom-overlay">Custom Overlay: {props.count}</div>;
};
