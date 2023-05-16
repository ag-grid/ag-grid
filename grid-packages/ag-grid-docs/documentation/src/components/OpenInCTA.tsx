import classnames from 'classnames';
import React, { FunctionComponent, MouseEventHandler, ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './OpenInCTA.module.scss';

type CtaType = 'newTab' | 'plunkr' | 'stackblitz' | 'codesandbox';

type BaseProps = {
    type: CtaType;
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
            Open in New Tab <Icon name="docs-import-export" />
        </>
    ),
    plunkr: (
        <>
            Open in Plunkr <Icon name="plunkr" />
        </>
    ),
    stackblitz: (
        <>
            Open in StackBlitz <Icon name="stackblitz" />
        </>
    ),
    codesandbox: (
        <>
            Open in CodeSandbox <Icon name="codesandbox" />
        </>
    ),
};

export const OpenInCTA: FunctionComponent<Props> = (props) => {
    const { type } = props;
    const copyText = COPY_TEXT[type];

    const isButton = Boolean((props as ButtonProps).onClick);

    if (isButton) {
        const { onClick } = props as ButtonProps;
        return (
            <button className={classnames('button-style-none', styles.cta)} onClick={onClick}>
                {copyText}
            </button>
        );
    } else {
        const { href } = props as LinkProps;
        return (
            <a className={styles.cta} href={href} target="_blank" rel="noreferrer">
                {copyText}
            </a>
        );
    }
};
