import React, { Fragment } from 'react';

export default ({ model, onModelChange, color }) => {
    const value = (model && model.filter) || '';

    const onInput = ({ target: { value: newValue } }) => {
        onModelChange(
            newValue === ''
                ? null
                : {
                      ...(model || {
                          type: 'greaterThan',
                      }),
                      filter: Number(newValue),
                  }
        );
    };

    const style = {
        borderColor: color,
        width: '30px',
    };

    return (
        <Fragment>
            &gt; <input value={value} style={style} type="number" min="0" onInput={onInput} />
        </Fragment>
    );
};
