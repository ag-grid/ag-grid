import React from 'react';

export default (props) => {
    const { value } = props;

    if (value === null) {
        return;
    }

    const values = Array.isArray(value) ? value : [value];

    return (
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {values.map((value, idx) => (
                <React.Fragment key={value}>
                    <span
                        style={{
                            borderLeft: '10px solid ' + value,
                            paddingRight: '5px',
                        }}
                    ></span>
                    {value}
                    {idx !== values.length - 1 && ', '}
                </React.Fragment>
            ))}
        </div>
    );
};
