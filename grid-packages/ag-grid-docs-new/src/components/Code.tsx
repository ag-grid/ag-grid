import classnames from 'classnames';
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-typescript';
import 'prismjs/plugins/keep-markup/prism-keep-markup';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import { memo, useEffect, useRef } from 'react';

const GrammarMap = {
    js: Prism.languages.javascript,
    ts: Prism.languages.typescript,
    css: Prism.languages.css,
    bash: Prism.languages.bash,
    html: Prism.languages.html,
    jsx: Prism.languages.jsx,
    java: Prism.languages.java,
    sql: Prism.languages.sql,
    diff: Prism.languages.diff,
    scss: Prism.languages.scss,
};

export type Language = keyof typeof GrammarMap;

/**
 * This uses Prism to highlight a provided code snippet.
 */
function Code({
    code,
    language = 'ts',
    className,
    keepMarkup = false,
    lineNumbers = false,
    ...props
}: {
    code: string | string[];
    language?: Language;
    className?: string;
    keepMarkup?: boolean;
    lineNumbers?: boolean;
}) {
    if (Array.isArray(code)) {
        code = code.join('\n');
    }

    return (
        <pre
            className={classnames('code', `language-${language}`, className, lineNumbers ? 'line-numbers' : null)}
            {...props}
        >
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
