import type { FunctionComponent, ReactElement } from 'react';
import AnimateHeight from 'react-animate-height';

interface Props {
    id?: string;
    isDisabled?: boolean;
    isOpen: boolean;
    animationDuration?: number;
    children: ReactElement;
}

export const Collapsible: FunctionComponent<Props> = ({
    id,
    isDisabled,
    isOpen,
    animationDuration = 330,
    children,
}) => {
    if (isDisabled) {
        return children;
    }

    const height = isOpen ? 'auto' : 0;
    return (
        <AnimateHeight id={id} duration={animationDuration} height={height}>
            {children}
        </AnimateHeight>
    );
};
