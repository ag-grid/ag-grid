import { createElement, FunctionComponent } from 'react';

export const AGStyles: FunctionComponent = ({ children }) => {
    return createElement(
        'div',
        {
            className: 'ag-styles font-size-responsive',
        },
        children
    );
};
