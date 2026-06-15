import { Icon } from '@ag-website-shared/components/icon/Icon';
import classnames from 'classnames';
import { memo, useEffect, useState } from 'react';
import { getSingletonHighlighter } from 'shiki';

import styles from './Code.module.scss';
import codeStyles from './CodeHighlight.module.scss';
import { extractDecorations } from './keepMarkup';
import agDocsTheme from './theme.json';

const LANGS = [
    'javascript',
    'typescript',
    'json',
    'css',
    'scss',
    'bash',
    'html',
    'jsx',
    'tsx',
    'java',
    'sql',
    'diff',
    'xml',
    'shellsession',
] as const;

export const LanguageMap = {
    js: 'javascript',
    json: 'json',
    ts: 'typescript',
    css: 'css',
    bash: 'bash',
    shell: 'shellsession',
    html: 'html',
    jsx: 'jsx',
    java: 'java',
    sql: 'sql',
    diff: 'diff',
    scss: 'scss',
    xml: 'xml',
} as const;

export type Language = keyof typeof LanguageMap;

// Initialise once at module load — promise is shared across all component instances.
const highlighterPromise = getSingletonHighlighter({
    langs: [...LANGS],
    themes: [agDocsTheme as Parameters<typeof getSingletonHighlighter>[0]['themes'][number]],
});

// In-memory cache keyed by `keepMarkup:lang:code` to avoid redundant re-highlighting.
const cache = new Map<string, string>();

function highlight(code: string, language: Language, keepMarkup: boolean): Promise<string> {
    const key = `${keepMarkup}:${language}:${code}`;
    if (cache.has(key)) {
        return Promise.resolve(cache.get(key)!);
    }

    const { cleanCode, decorations } = keepMarkup
        ? extractDecorations(code.trimEnd())
        : { cleanCode: code.trimEnd(), decorations: [] };

    return highlighterPromise.then((hl) => {
        const html = hl.codeToHtml(cleanCode, {
            lang: LanguageMap[language],
            theme: 'ag-docs',
            decorations,
        });
        cache.set(key, html);
        return html;
    });
}

function CopyToClipboardButton({ code }: { code: string }) {
    const [hasCopied, setHasCopied] = useState(false);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(code);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <span
            className={classnames(styles.clipboardButtonOuter, hasCopied ? styles.hasCopied : '')}
            onClick={copyToClipboard}
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

function Code({
    code,
    language = 'ts',
    className,
    lineNumbers = false,
    copyToClipboard = false,
    keepMarkup = false,
    preHighlightedHtml,
    ...props
}: {
    code: string | string[];
    language?: Language;
    className?: string;
    lineNumbers?: boolean;
    copyToClipboard?: boolean;
    keepMarkup?: boolean;
    preHighlightedHtml?: string;
}) {
    const codeStr = Array.isArray(code) ? code.join('\n') : code;

    const [highlightedHtml, setHighlightedHtml] = useState<string | null>(preHighlightedHtml ?? null);

    useEffect(() => {
        // keepMarkup content is dynamic (runtime links) so cannot use pre-highlighted HTML.
        // For all other cases, pre-highlighted HTML from build time is used as-is.
        if (preHighlightedHtml && !keepMarkup) return;
        let cancelled = false;
        highlight(codeStr, language, keepMarkup).then((html) => {
            if (!cancelled) setHighlightedHtml(html);
        });
        return () => {
            cancelled = true;
        };
    }, [codeStr, language, keepMarkup, preHighlightedHtml]);

    return (
        <pre
            className={classnames(
                'code',
                `language-${language}`,
                className,
                codeStyles.shikiPre,
                lineNumbers ? codeStyles.lineNumbers : null,
                copyToClipboard ? 'copy-to-clipboard' : ''
            )}
            {...props}
        >
            {copyToClipboard && <CopyToClipboardButton code={codeStr} />}
            {highlightedHtml ? <ShikiCode html={highlightedHtml} /> : <code>{codeStr}</code>}
        </pre>
    );
}

function ShikiCode({ html }: { html: string }) {
    const codeMatch = html.match(/<code[^>]*>([\s\S]*)<\/code>/);
    const innerHtml = codeMatch ? codeMatch[1] : html;

    return <code className={codeStyles.shikiCode} data-shiki="" dangerouslySetInnerHTML={{ __html: innerHtml }} />;
}

export default memo(Code);
