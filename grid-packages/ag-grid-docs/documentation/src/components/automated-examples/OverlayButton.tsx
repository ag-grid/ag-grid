import classNames from 'classnames';
import React, { FunctionComponent, useEffect, useRef } from 'react';
import { initForwardMouseEventsThroughElement } from './lib/initForwardMouseEventsThroughElement';
import styles from './OverlayButton.module.scss';

interface Props {
    ariaLabel: string;
    isHidden?: boolean;
    onPointerEnter?: () => void;
    onPointerOut?: () => void;
    onClick?: () => void;
}

export const OverlayButton: FunctionComponent<Props> = ({
    ariaLabel,
    isHidden,
    onPointerEnter,
    onPointerOut,
    onClick,
}) => {
    const clickTarget = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!clickTarget.current) {
            return;
        }

        const { cleanUp } = initForwardMouseEventsThroughElement({
            element: clickTarget.current,
            // Only forward script generated event
            condition: (event) => !event.isTrusted,
        });

        return () => {
            cleanUp();
        };
    }, [clickTarget.current]);

    return (
        <button
            className={classNames('button-style-none', 'overlay-button', styles.overlay, {
                [styles.hide]: isHidden,
            })}
            ref={clickTarget}
            aria-label={ariaLabel}
            onPointerEnter={() => onPointerEnter && onPointerEnter()}
            onPointerOut={() => onPointerOut && onPointerOut()}
            onClick={() => onClick && onClick()}
        ></button>
    );
};
