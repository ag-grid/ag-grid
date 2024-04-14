import { Icon } from '@ag-website-shared/components/icon/Icon';
import styles from '@legacy-design-system/modules/OpenInCTA.module.scss';
import classnames from 'classnames';
import type { FunctionComponent, MouseEventHandler, ReactNode } from 'react';

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

const COPY_TEXT: Record<CtaType, ReactNode> = {
    newTab: (
        <>
            <span className={styles.tooltip}>New Tab</span>
            <Icon name="newTab" />
        </>
    ),
    plunker: (
        <>
            <span className={styles.tooltip}>Plunker</span>
            <Icon name="plunker" />
        </>
    ),
    stackblitz: (
        <>
            <span className={styles.tooltip}>StackBlitz</span>
            <Icon name="stackblitz" />
        </>
    ),
    codesandbox: (
        <>
            <span className={styles.tooltip}>CodeSandbox</span>
            <Icon name="codesandbox" />
        </>
    ),
};

export const OpenInCTA: FunctionComponent<Props> = (props) => {
    const { type, tracking } = props;
    const copyText = COPY_TEXT[type];

    const isButton = Boolean((props as ButtonProps).onClick);

    if (isButton) {
        const { onClick } = props as ButtonProps;
        return (
            <button
                className={classnames('button-style-none', styles.cta)}
                onClick={(event) => {
                    onClick(event);
                    tracking && tracking();
                }}
            >
                {copyText}
            </button>
        );
    } else {
        const { href } = props as LinkProps;
        return (
            <a
                className={styles.cta}
                href={href}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                    tracking && tracking();
                }}
            >
                {copyText}
            </a>
        );
    }
};
