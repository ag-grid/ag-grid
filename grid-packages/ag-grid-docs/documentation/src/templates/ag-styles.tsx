import { createElement, FunctionComponent } from "react";

interface Props {
    isInline: boolean
}

export const AGStyles: FunctionComponent<Props> = ({ isInline, children }) => {
    const wrapperElem = isInline ? 'span' : 'div';
    return createElement(wrapperElem, {
        className: "ag-styles"
    }, children);
};
