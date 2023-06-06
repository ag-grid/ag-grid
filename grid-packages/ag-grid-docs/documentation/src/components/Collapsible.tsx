import React, { FunctionComponent, ReactElement } from 'react';
import AnimateHeight from 'react-animate-height';

interface Props {
    id: string;
    isEnabled: boolean;
    isOpen: boolean;
    children: ReactElement;
}

export const Collapsible: FunctionComponent<Props> = ({ id, isEnabled, isOpen, children }) => {
    if (!isEnabled) {
        return children;
    }

    const height = isOpen ? 'auto' : 0;
    return (
        <AnimateHeight id={id} duration={250} height={height}>
            {children}
        </AnimateHeight>
    );
};
