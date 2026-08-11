import { Icon } from '@ag-website-shared/components/icon/Icon';
import classnames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';

interface Props {
    /** Text placed on the clipboard. */
    value: string;
    /** Visible label; defaults to the value, which is what token and class-name rows want. */
    label?: string;
    /** Renders as a bare inline control with no button chrome. */
    inline?: boolean;
    className?: string;
}

/**
 * Click-to-copy control for a token name, class name or snippet.
 *
 * Every value in the guide is copyable, because the single most common reason to open a style
 * guide is to get the exact name of something into your editor without retyping it.
 */
export const CopyButton: FunctionComponent<Props> = ({ value, label, inline = false, className }) => {
    const [copied, setCopied] = useState(false);
    const resetTimer = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => () => clearTimeout(resetTimer.current), []);

    const copy = useCallback(() => {
        // `writeText` rejects when the document is not focused or the permission is denied; the
        // guide should not blow up in that case, it just does not confirm.
        navigator.clipboard?.writeText(value).then(
            () => {
                setCopied(true);
                clearTimeout(resetTimer.current);
                resetTimer.current = setTimeout(() => setCopied(false), 1200);
            },
            () => setCopied(false)
        );
    }, [value]);

    return (
        <button
            type="button"
            onClick={copy}
            title={`Copy ${value}`}
            aria-label={`Copy ${value}`}
            className={classnames('button-style-none', styles.copyButton, className, {
                [styles.copyButtonInline]: inline,
                [styles.copyButtonCopied]: copied,
            })}
        >
            <span className={styles.copyButtonLabel}>{label ?? value}</span>
            <Icon name={copied ? 'tick' : 'copy'} />
        </button>
    );
};
