import React from 'react';

export default (props) =>
    props.value && (
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {(Array.isArray(props.value) ? props.value : [props.value]).map((value, idx, values) => (
                <React.Fragment key={value}>
                    <span
                        style={{
                            borderLeft: '10px solid ' + value,
                            paddingRight: '2px',
                        }}
                    ></span>
                    {value}
                    {idx !== values.length - 1 && ', '}
                </React.Fragment>
            ))}
        </div>
    );
