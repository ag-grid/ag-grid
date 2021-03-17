import React, { memo, useEffect, useRef } from 'react';
import classnames from 'classnames';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-scss';
import 'prismjs/plugins/keep-markup/prism-keep-markup';
import styles from './Code.module.scss';

/**
 * This uses Prism to highlight a provided code snippet.
 */
const Code = ({ code, language = 'ts', plugins, className, keepMarkup, ...props }) => {
    const ref = useRef();

    useEffect(() => {
        if (ref && ref.current) {
            // using highlightElement() rather than highlight() utilises more of the Prism lifecycle,
            // allowing us to use plugins
            Prism.highlightElement(ref.current);
        }
    });

    if (Array.isArray(code)) {
        code = code.join('\n');
    }

    return <pre className={classnames(styles['code'], `language-${language}`, className)} {...props}>
        {keepMarkup && <code ref={ref} dangerouslySetInnerHTML={{ __html: code }} />}
        {!keepMarkup && <code ref={ref}>{code}</code>}
    </pre>;
};

export default memo(Code);