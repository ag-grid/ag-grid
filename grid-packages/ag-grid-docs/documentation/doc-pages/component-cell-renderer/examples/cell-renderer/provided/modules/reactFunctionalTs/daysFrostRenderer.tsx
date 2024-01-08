import { CustomCellRendererProps } from '@ag-grid-community/react';
import React from 'react';

export interface ImageCellRendererParams extends CustomCellRendererProps {
    rendererImage: string;
    showPrefix: boolean;
}

export default (props: ImageCellRendererParams) => (
    <span>
        {props.showPrefix && (<span>Days: </span>)}
        {
            new Array(props.value).fill('')
                .map((_, idx) =>
                    (<img key={idx} src={`https://www.ag-grid.com/example-assets/weather/${props.rendererImage}`} />)
                )
        }
    </span>
);

