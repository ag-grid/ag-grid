import { Icon } from '@ag-website-shared/components/icon/Icon';
import classnames from 'classnames';
import type { FunctionComponent, MouseEventHandler } from 'react';

import tooltipStyles from '../tooltip/Tooltip.module.scss';
import styles from './OpenInCTA.module.scss';

type CtaType = 'newTab' | 'plunker' | 'stackblitz' | 'codesandbox';

type BaseProps = {
    type: CtaType;
    tracking?: () => void;
};

type ButtonProps = BaseProps & {
    onClick: MouseEventHandler<HTMLButtonElement>;
};

type LinkProps = BaseProps & {
    href: string;
};

type Props = ButtonProps | LinkProps;

const DISPLAY_NAME: Record<CtaType, string> = {
    newTab: 'New Tab',
    plunker: 'Plunker',
    stackblitz: 'StackBlitz',
    codesandbox: 'CodeSandbox',
};

export const OpenInCTA: FunctionComponent<Props> = (props) => {
    const { type, tracking } = props;
    const tooltip = (
        <span className={classnames(tooltipStyles.bubble, tooltipStyles.bubbleLarge)}>{DISPLAY_NAME[type]}</span>
    );

    const isButton = Boolean((props as ButtonProps).onClick);

    if (isButton) {
        const { onClick } = props as ButtonProps;
        return (
            <span className={classnames(styles.cta, tooltipStyles.trigger)}>
                {tooltip}
                <button
                    className="button-style-none"
                    aria-label={DISPLAY_NAME[type]}
                    tabIndex={0}
                    onClick={(event) => {
                        onClick(event);
                        tracking?.();
                    }}
                >
                    <Icon name={type} />
                </button>
            </span>
        );
    } else {
        const { href } = props as LinkProps;
        return (
            <span className={classnames(styles.cta, tooltipStyles.trigger)}>
                {tooltip}
                <a
                    href={href}
                    target="_blank"
                    tabIndex={0}
                    rel="noreferrer"
                    onClick={() => {
                        tracking?.();
                    }}
                    aria-label={DISPLAY_NAME[type]}
                >
                    <Icon name={type} />
                </a>
            </span>
        );
    }
};
