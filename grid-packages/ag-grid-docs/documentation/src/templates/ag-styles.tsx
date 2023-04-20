import { createElement, FunctionComponent, ReactNode } from 'react';

interface Props {
    hasFontSizeResponsive: boolean;
    children: ReactNode;
}

export const AGStyles: FunctionComponent<Props> = ({ hasFontSizeResponsive = true, children }) => {
    return createElement(
        'div',
        {
            className: `ag-styles ${hasFontSizeResponsive && 'font-size-responsive'}`,
        },
        children
    );
};
