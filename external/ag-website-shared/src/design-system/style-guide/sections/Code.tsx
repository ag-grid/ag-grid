import { Snippet } from '@ag-website-shared/components/snippet/Snippet';
import type { FunctionComponent } from 'react';

import { useStyleGuide, useTokens } from '../StyleGuideContext';
import { Block, Gotcha, KnownIssue, Section } from '../chrome/Section';
import { Specimen } from '../chrome/Specimen';
import { TokenTable } from '../chrome/TokenTable';

const EXAMPLE = `const gridOptions = {
    columnDefs: [
        { field: 'athlete', pinned: 'left' },
        { field: 'country', rowGroup: true },
    ],
    // Stable ids let the grid track rows across updates
    getRowId: (params) => params.data.id,
};`;

/** Code presentation: inline fragments, plain preformatted blocks, and highlighted snippets. */
export const Code: FunctionComponent = () => {
    const { tokensByName } = useStyleGuide();
    const codeColours = useTokens('--color-code-');
    const codeBackground = tokensByName.get('--color-code-background');

    return (
        <Section
            id="code"
            title="Code"
            source={['elements/_inline.scss', 'elements/_block.scss', 'components/_code.scss']}
            lede={
                <p>
                    Three levels: <code>&lt;code&gt;</code> for an identifier in a sentence, <code>&lt;pre&gt;</code>{' '}
                    for a literal block with no highlighting, and <code>Snippet</code> for source that should be
                    highlighted and copyable.
                </p>
            }
        >
            <Block
                title="Inline"
                note={
                    <p>
                        Renders at <code>0.875em</code> of its context, so it scales inside a heading too. For anything
                        the reader would type or find in an API.
                    </p>
                }
            >
                <Specimen code={`Set <code>rowSelection</code> to <code>'multiple'</code>.`}>
                    <p>
                        Set <code>rowSelection</code> to <code>&apos;multiple&apos;</code> to allow more than one row to
                        be selected, then read the result with <code>api.getSelectedRows()</code>. The file lives at{' '}
                        <code>src/gridOptions.ts</code>.
                    </p>
                    <h3>
                        Even inside a heading, <code>code</code> scales with it
                    </h3>
                </Specimen>
            </Block>

            <Block
                title="Preformatted"
                note={
                    <p>
                        Whitespace preserved, no highlighting. For output, logs and directory trees, where highlighting
                        would be misleading.
                    </p>
                }
            >
                <Specimen code={`<pre>`}>
                    <pre>{`dist/
├── ag-grid-community.js
├── ag-grid-community.min.js
└── styles/
    └── ag-grid.css`}</pre>
                </Specimen>
            </Block>

            <Block title="Highlighted snippets">
                <Specimen label="Default" code={`<Snippet framework="javascript" content={source} />`}>
                    <Snippet framework="javascript" content={EXAMPLE} />
                </Specimen>

                <Specimen
                    label="With line numbers and copy"
                    code={`<Snippet
    framework="javascript"
    content={source}
    lineNumbers
    copyToClipboard
/>`}
                >
                    <Snippet framework="javascript" content={EXAMPLE} lineNumbers copyToClipboard />
                </Specimen>
            </Block>

            <Block
                title="Syntax colours"
                note={
                    <p>
                        Hand-tuned per theme rather than re-pointed at the palette - highlighting needs hue separation a
                        neutral scale cannot give. Contrast is against <code>--color-code-background</code>.
                    </p>
                }
            >
                <TokenTable tokens={codeColours} contrastAgainst={codeBackground} />
            </Block>

            <Gotcha>
                <code>&lt;code&gt;</code> means &ldquo;a literal you would type&rdquo;, not &ldquo;this is
                important&rdquo; - don&rsquo;t use it for emphasis. Explain a line with a comment inside the snippet
                rather than prose after it, so the explanation travels with the code when it is copied.
            </Gotcha>

            <KnownIssue>
                <p>
                    Two tokens describe the code block background: <code>--color-bg-code</code> and{' '}
                    <code>--color-code-background</code>. They resolve to different values and are consumed by different
                    parts of the CSS - <code>elements/_inline.scss</code> uses the first for inline{' '}
                    <code>&lt;code&gt;</code>, <code>components/_code.scss</code> uses the second for{' '}
                    <code>pre.code</code>. The dark-mode override only touches the first.
                </p>
                <p>
                    <code>components/_code.scss</code> also sets <code>color: black</code> literally on{' '}
                    <code>pre.code</code> before overriding it in the dark-mode block, rather than using a token.
                </p>
            </KnownIssue>
        </Section>
    );
};
