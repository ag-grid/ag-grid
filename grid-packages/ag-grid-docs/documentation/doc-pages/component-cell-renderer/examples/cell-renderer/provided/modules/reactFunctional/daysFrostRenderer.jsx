import React from 'react';

export default props => (
    <span>
        {
            new Array(props.value).fill('')
                .map(ignore =>
                    (<img src={`https://www.ag-grid.com/example-assets/weather/${props.rendererImage}`}/>)
                )
        }
    </span>
);

