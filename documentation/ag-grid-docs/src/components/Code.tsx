import { Icon } from '@ag-website-shared/components/icon/Icon';
import classnames from 'classnames';
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-shell-session';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-xml-doc';
import 'prismjs/plugins/keep-markup/prism-keep-markup';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import { memo, useEffect, useRef, useState } from 'react';

import styles from './Code.module.scss';

const GrammarMap = {
    js: Prism.languages.javascript,
    json: Prism.languages.json,
    ts: Prism.languages.typescript,
    css: Prism.languages.css,
    bash: Prism.languages.bash,
    shell: Prism.languages.shellsession,
    html: Prism.languages.html,
    jsx: Prism.languages.jsx,
    java: Prism.languages.java,
    sql: Prism.languages.sql,
    diff: Prism.languages.diff,
    scss: Prism.languages.scss,
    xml: Prism.languages.xml,
};

export type Language = keyof typeof GrammarMap;

function CopyToClipboardButton({ code }: { code: string | string[] }) {
    const [hasCopied, setHasCopied] = useState(false);

    const copyToClipboard = async (code) => {
        await navigator.clipboard.writeText(code);
        await setHasCopied(true);
        await setTimeout(() => {
            setHasCopied(false);
        }, 2000);
    };

    return (
        <span
            className={classnames(styles.clipboardButtonOuter, hasCopied ? styles.hasCopied : '')}
            onClick={() => {
                copyToClipboard(code);
            }}
        >
            <span className={styles.clipboardButtonCopiedOuter}>
                {hasCopied ? (
                    <span className={styles.clipboardButtonCopied}>Copied</span>
                ) : (
                    <span className={styles.clipboardButtonCopied}>Copy</span>
                )}
            </span>
            <span className={styles.clipboardButton}>
                {hasCopied ? <Icon className={styles.check} name={'check'} /> : <Icon name={'copy'} />}
            </span>
        </span>
    );
}

/**
 * This uses Prism to highlight a provided code snippet.
 */
function Code({
    code,
    language = 'ts',
    className,
    keepMarkup = false,
    lineNumbers = false,
    copyToClipboard = true,
    ...props
}: {
    code: string | string[];
    language?: Language;
    className?: string;
    keepMarkup?: boolean;
    lineNumbers?: boolean;
    copyToClipboard?: boolean;
}) {
    if (Array.isArray(code)) {
        code = code.join('\n');
    }

    return (
        <pre
            className={classnames(
                'code',
                `language-${language}`,
                className,
                lineNumbers ? 'line-numbers' : null,
                copyToClipboard ? 'copy-to-clipboard' : ''
            )}
            {...props}
        >
            {copyToClipboard && <CopyToClipboardButton code={code} />}

            {keepMarkup || lineNumbers ? (
                <CodeWithPrismPlugins code={code} keepMarkup={keepMarkup} />
            ) : (
                <CodeWithoutPrismPlugins language={language} code={code} />
            )}
        </pre>
    );
}

/**
 * This component uses Prism.highlightElement() rather than Prism.highlight() which utilises more of the Prism lifecycle,
 * allowing us to use plugins (e.g. keep-markup), but is much less performant, so should only be used where plugins
 * are required.
 */
const CodeWithPrismPlugins = ({ code, keepMarkup }: { code: string; keepMarkup: boolean }) => {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        if (ref.current) {
            Prism.highlightElement(ref.current);
        }
    });

    return keepMarkup ? <code ref={ref} dangerouslySetInnerHTML={{ __html: code }} /> : <code ref={ref}>{code}</code>;
};

/**
 * This uses Prism.highlight() which is the most-performant method for syntax highlighting because it only executes a
 * small part of the Prism lifecycle.
 */
const CodeWithoutPrismPlugins = ({ code, language }: { code: string; language: Language }) => (
    <code dangerouslySetInnerHTML={{ __html: Prism.highlight(code, GrammarMap[language], language) }} />
);

export default memo(Code);
