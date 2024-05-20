import React, { Fragment } from 'react';

export default ({ model, onModelChange }) => {
    const onInput = ({ target: { value } }) => onModelChange(value === '' ? null : Number(value));

    return (
        <Fragment>
            &gt;{' '}
            <input
                value={model == null ? '' : model}
                style={{ width: '30px' }}
                type="number"
                min="0"
                onInput={onInput}
            />
        </Fragment>
    );
};
