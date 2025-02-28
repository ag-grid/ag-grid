import React from 'react';

import type { CustomInnerHeaderGroupProps } from 'ag-grid-react';

export interface MyCustomInnerHeaderGroupProps extends CustomInnerHeaderGroupProps {
    icon: string;
}

export default (props: MyCustomInnerHeaderGroupProps) => {
    return (
        <div className="customInnerHeaderGroup">
            {props.icon && <i className={`fa ${props.icon}`}></i>}
            <span>{props.displayName}</span>
        </div>
    );
};
