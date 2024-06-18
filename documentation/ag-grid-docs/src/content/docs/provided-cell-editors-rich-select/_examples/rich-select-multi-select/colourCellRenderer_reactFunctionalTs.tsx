import type { CustomCellRendererProps } from '@ag-grid-community/react';
import React from 'react';

import { getLuma } from './color-component-helper';

const createPill = (color: string) => (
    <span style={{ backgroundColor: color }} className={getLuma(color) < 150 ? 'dark' : 'light'}>
        {color}
    </span>
);

const createTag = (color: string) => <span style={{ borderColor: color }}>{color}</span>;

export default (props: CustomCellRendererProps) => {
    if (props.value == null) {
        return;
    }
    const isPill = Array.isArray(props.value);
    const values = isPill ? props.value : [props.value];

    return (
        <div className={'custom-color-cell-renderer ' + (isPill ? 'color-pill' : 'color-tag')}>
            {values
                .filter((value: string | null) => value != null && value !== '')
                .map((value: string) => (
                    <React.Fragment key={value}>
                        {typeof props.value === 'string' ? createTag(value) : createPill(value)}
                    </React.Fragment>
                ))}
        </div>
    );
};
