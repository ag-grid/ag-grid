import React, { forwardRef } from 'react';

const DetailCellRenderer = forwardRef((props, ref) => {
    return (
        <div
            ref={ref}
            style={{
                whiteSpace: 'normal',
                padding: '25px',
                fontSize: '16px',
            }}
            dangerouslySetInnerHTML={{ __html: props.message }}
        ></div>
    );
});

export default DetailCellRenderer;
