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
import React, { memo, useEffect, useRef } from 'react';

/**
 * This uses Prism to highlight a provided code snippet.
 */
const Code = ({ code, language = 'ts', className = undefined, keepMarkup = false, lineNumbers = false, ...props }) => {
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
};

/**
 * This component uses Prism.highlightElement() rather than Prism.highlight() which utilises more of the Prism lifecycle,
 * allowing us to use plugins (e.g. keep-markup), but is much less performant, so should only be used where plugins
 * are required.
 */
const CodeWithPrismPlugins = ({ code, keepMarkup }) => {
    const ref = useRef();

    useEffect(() => {
        if (ref && ref.current) {
            const { current } = ref;

            Prism.highlightElement(current);
        }
    });

    return keepMarkup ? <code ref={ref} dangerouslySetInnerHTML={{ __html: code }} /> : <code ref={ref}>{code}</code>;
};

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

/**
 * This uses Prism.highlight() which is the most-performant method for syntax highlighting because it only executes a
 * small part of the Prism lifecycle.
 */
const CodeWithoutPrismPlugins = ({ code, language }) => (
    <code dangerouslySetInnerHTML={{ __html: Prism.highlight(code, GrammarMap[language], language) }} />
);

export default memo(Code);
