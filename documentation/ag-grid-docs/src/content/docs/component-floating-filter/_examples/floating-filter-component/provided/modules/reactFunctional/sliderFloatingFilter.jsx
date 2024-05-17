import React from 'react';

export default ({ model, onModelChange, maxValue }) => {
    const value = (model && model.filter) || 0;

    const onChange = ({ target: { value: newValue } }) => {
        onModelChange(
            newValue === '' || newValue === '0'
                ? null
                : {
                      ...(model || {
                          type: 'greaterThan',
                      }),
                      filter: Number(newValue),
                  }
        );
    };

    return <input type="range" value={value} min={0} max={maxValue} step={1} onChange={onChange} />;
};
