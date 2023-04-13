import classnames from 'classnames';
import React, { FunctionComponent, ReactNode } from 'react';
import styles from './ToggleAutomatedExampleButton.module.scss';

interface Props {
    isHoveredOver: boolean;
    onClick?: () => void;
    children: ReactNode;
}

export const ToggleAutomatedExampleButton: FunctionComponent<Props> = ({ isHoveredOver, onClick, children }) => {
    return (
        <button
            className={classnames(styles.button, {
                hover: isHoveredOver,
            })}
            onClick={() => {
                onClick && onClick();
            }}
        >
            {children}
        </button>
    );
};
