import type { Framework } from '@ag-grid-types';
import type { Language } from '@ag-website-shared/components/code/Code';
import Code from '@ag-website-shared/components/code/Code';
import CodeShiki from '@ag-website-shared/components/code/CodeShiki';
import { throwDevWarning } from '@ag-website-shared/utils/throwDevWarning';
import * as snippetTransformer from '@components/snippet/snippetTransformer';

const languages = {
    react: 'jsx',
    javascript: 'js',
    angular: 'ts',
    vue: 'ts',
};

interface Props {
    framework: Framework;
    content: string;
    transform?: boolean;
    shiki?: boolean;
    language?: Language;
    lineNumbers?: boolean;
    suppressFrameworkContext?: boolean;
    spaceBetweenProperties?: boolean;
    inlineReactProperties?: boolean;
    copyToClipboard?: boolean;
    children?: any;
}

/**
 * This takes a code snippet written in JavaScript and transforms it into an idiomatic code snippet for the selected
 * framework.
 */
export const Snippet = (props: Props) => {
    const {
        framework,
        content,
        transform,
        language,
        lineNumbers,
        suppressFrameworkContext,
        spaceBetweenProperties,
        inlineReactProperties,
        copyToClipboard,
        shiki,
    } = props;

    if (!content) {
        throwDevWarning({ message: 'No content in snippet' });
        return;
    }

    // create FW specific snippet
    const snippet = transform
        ? snippetTransformer.transform(content, framework, {
              suppressFrameworkContext,
              spaceBetweenProperties,
              inlineReactProperties,
          })
        : content;

    return (
        <>
            {shiki ? (
                <CodeShiki
                    code={snippet}
                    language={language ? language : (languages[framework] as Language)}
                    lineNumbers={lineNumbers}
                    copyToClipboard={copyToClipboard}
                />
            ) : (
                <Code
                    code={snippet}
                    language={language ? language : (languages[framework] as Language)}
                    lineNumbers={lineNumbers}
                    copyToClipboard={copyToClipboard}
                />
            )}
        </>
    );
};
