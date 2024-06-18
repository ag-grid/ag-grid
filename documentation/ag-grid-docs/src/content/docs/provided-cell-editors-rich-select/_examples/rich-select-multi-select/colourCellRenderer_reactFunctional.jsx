import React from 'react';

import { getLuma } from './color-component-helper';

const createPill = (color) => (
    <span style={{ backgroundColor: color }} className={getLuma(color) < 150 ? 'dark' : 'light'}>
        {color}
    </span>
);

const createTag = (color) => <span style={{ borderColor: color }}>{color}</span>;

export default (props) => {
    if (props.value == null) {
        return;
    }
    const isPill = Array.isArray(props.value);
    const values = isPill ? props.value : [props.value];

    return (
        <div className={'custom-color-cell-renderer ' + (isPill ? 'color-pill' : 'color-tag')}>
            {values
                .filter((value) => value != null && value !== '')
                .map((value) => (
                    <React.Fragment key={value}>
                        {typeof props.value === 'string' ? createTag(value) : createPill(value)}
                    </React.Fragment>
                ))}
        </div>
    );
};
