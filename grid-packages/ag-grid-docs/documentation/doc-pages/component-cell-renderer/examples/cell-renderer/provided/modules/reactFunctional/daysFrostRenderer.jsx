import React from 'react';

export default props => (
    <span>
        {
            new Array(props.value).fill('')
                .map((_, idx) =>
                    (<img key={idx} src={`https://www.ag-grid.com/example-assets/weather/${props.rendererImage}`} />)
                )
        }
    </span>
);

