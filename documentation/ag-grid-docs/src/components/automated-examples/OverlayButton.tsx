import styles from '@legacy-design-system/modules/OverlayButton.module.scss';
import classNames from 'classnames';
import { type FunctionComponent, forwardRef, useEffect } from 'react';

import { initForwardMouseEventsThroughElement } from './lib/initForwardMouseEventsThroughElement';

interface Props {
    ariaLabel: string;
    isHidden?: boolean;
    onPointerEnter?: () => void;
    onPointerOut?: () => void;
    onClick?: () => void;
}

export const OverlayButton: FunctionComponent<Props> = forwardRef(
    ({ ariaLabel, isHidden, onPointerEnter, onPointerOut, onClick }, ref: any) => {
        useEffect(() => {
            if (!ref?.current) {
                return;
            }

            const { cleanUp } = initForwardMouseEventsThroughElement({
                element: ref?.current,
                // Only forward script generated event
                condition: (event) => !event.isTrusted,
            });

            return () => {
                cleanUp();
            };
        }, [ref?.current]);

        return (
            <button
                className={classNames('button-style-none', 'overlay-button', styles.overlay, {
                    [styles.hide]: isHidden,
                })}
                ref={ref}
                aria-label={ariaLabel}
                onPointerEnter={() => onPointerEnter && onPointerEnter()}
                onPointerOut={() => onPointerOut && onPointerOut()}
                onClick={() => onClick && onClick()}
            ></button>
        );
    }
);
