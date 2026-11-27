import { Icon } from '@ag-website-shared/components/icon/Icon';
import classnames from 'classnames';
import { Fragment, memo, useEffect, useState, useSyncExternalStore } from 'react';

import styles from './Code.module.scss';
import codeStyles from './CodeHighlight.module.scss';
import type * as CodeHighlighter from './codeHighlighter';
import { extractDecorations } from './keepMarkup';

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

type HighlighterModule = typeof CodeHighlighter;

let highlighterModule: HighlighterModule | undefined;

// Imported on first use, so code highlighted at build time (`preHighlightedHtml`) never loads Shiki.
function loadHighlighter(): Promise<HighlighterModule> {
    return import('./codeHighlighter').then((module) => (highlighterModule = module));
}

// Slow highlighting shows the plain code rather than an empty block.
const HOLD_UNHIGHLIGHTED_MS = 400;

// In-memory cache keyed by `keepMarkup:lang:code` to avoid redundant re-highlighting.
const cache = new Map<string, string>();
const cacheListeners = new Set<() => void>();

function subscribeToCache(listener: () => void) {
    cacheListeners.add(listener);
    return () => cacheListeners.delete(listener);
}

function prepareCode(code: string, keepMarkup: boolean) {
    return keepMarkup ? extractDecorations(code.trimEnd()) : { cleanCode: code.trimEnd(), decorations: [] };
}

function highlight(code: string, language: Language, keepMarkup: boolean): Promise<string> {
    const key = `${keepMarkup}:${language}:${code}`;
    if (cache.has(key)) {
        return Promise.resolve(cache.get(key)!);
    }

    const { cleanCode, decorations } = prepareCode(code, keepMarkup);

    return loadHighlighter()
        .then(({ highlightCode }) => highlightCode(cleanCode, LanguageMap[language], decorations))
        .then((html) => {
            cache.set(key, html);
            cacheListeners.forEach((listener) => listener());
            return html;
        });
}

// Lets a remounted block (e.g. a file switch in the example runner) paint highlighted on its first frame.
function highlightIfReady(code: string, language: Language, keepMarkup: boolean): string | undefined {
    const key = `${keepMarkup}:${language}:${code}`;
    const cached = cache.get(key);
    if (cached !== undefined || !highlighterModule) {
        return cached;
    }

    const { cleanCode, decorations } = prepareCode(code, keepMarkup);
    const html = highlighterModule.highlightCodeSync(cleanCode, LanguageMap[language], decorations);
    if (html !== undefined) {
        cache.set(key, html);
    }
    return html;
}

/** Loads the highlighter and the grammars for `languages` ahead of the code that needs them. */
export function preloadHighlighter(languages: string[]) {
    const langs = languages.flatMap((language) => LanguageMap[language as Language] ?? []);
    loadHighlighter().then(({ loadLanguages }) => loadLanguages(langs));
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
    revealWhenHighlighted = false,
    ...props
}: {
    code: string | string[];
    language?: Language;
    className?: string;
    lineNumbers?: boolean;
    copyToClipboard?: boolean;
    keepMarkup?: boolean;
    preHighlightedHtml?: string;
    /** Holds client-rendered code back until it is highlighted, then fades it in. Not for server-rendered code. */
    revealWhenHighlighted?: boolean;
}) {
    const codeStr = Array.isArray(code) ? code.join('\n') : code;

    // keepMarkup content is dynamic (runtime links) so cannot use pre-highlighted HTML.
    // For all other cases, pre-highlighted HTML from build time is used as-is.
    const usePreHighlighted = preHighlightedHtml != null && !keepMarkup;
    const getHighlightedHtml = () => (usePreHighlighted ? undefined : highlightIfReady(codeStr, language, keepMarkup));
    // The server snapshot keeps hydration matching the server render, which has nothing highlighted.
    const highlightedHtml = useSyncExternalStore(subscribeToCache, getHighlightedHtml, () => undefined);
    const isHighlighted = highlightedHtml !== undefined;

    useEffect(() => {
        if (usePreHighlighted || isHighlighted) return;
        highlight(codeStr, language, keepMarkup);
    }, [codeStr, language, keepMarkup, usePreHighlighted, isHighlighted]);

    const html = highlightedHtml ?? preHighlightedHtml;

    const [isHolding, setIsHolding] = useState(revealWhenHighlighted && !html);
    useEffect(() => {
        if (!isHolding || html) return;
        const timeout = setTimeout(() => setIsHolding(false), HOLD_UNHIGHLIGHTED_MS);
        return () => clearTimeout(timeout);
    }, [isHolding, html]);

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
            {html ? (
                <ShikiCode html={html} className={isHolding ? codeStyles.reveal : undefined} />
            ) : (
                <PlainCode code={codeStr} className={isHolding ? codeStyles.held : undefined} />
            )}
        </pre>
    );
}

// Shiki's line markup, so line numbers and padding are already in place when the colours arrive.
function PlainCode({ code, className }: { code: string; className?: string }) {
    return (
        <code className={classnames(codeStyles.shikiCode, className)}>
            {code
                .trimEnd()
                .split('\n')
                .map((line, index) => (
                    <Fragment key={index}>
                        {index > 0 && '\n'}
                        <span className="line">{line}</span>
                    </Fragment>
                ))}
        </code>
    );
}

function ShikiCode({ html, className }: { html: string; className?: string }) {
    const codeMatch = html.match(/<code[^>]*>([\s\S]*)<\/code>/);
    const innerHtml = codeMatch ? codeMatch[1] : html;

    return (
        <code
            className={classnames(codeStyles.shikiCode, className)}
            data-shiki=""
            dangerouslySetInnerHTML={{ __html: innerHtml }}
        />
    );
}

export default memo(Code);
