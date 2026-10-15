import { Snippet } from '@ag-website-shared/components/snippet/Snippet';
import type { FunctionComponent } from 'react';

import { useStyleGuide, useTokens } from '../StyleGuideContext';
import { Block, Guidance, Section } from '../chrome/Section';
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
                        Tuned per theme rather than taken from the palette, since highlighting needs hue separation a
                        neutral scale cannot give. Contrast is measured against <code>--color-code-background</code>.
                    </p>
                }
            >
                <TokenTable tokens={codeColours} contrastAgainst={codeBackground} />
            </Block>

            <Block title="Usage">
                <Guidance
                    dos={[
                        <>Use inline code for anything the reader would type or find in an API.</>,
                        <>Explain a line with a comment inside the snippet, so the explanation is copied with it.</>,
                        <>
                            Use a plain <code>&lt;pre&gt;</code> for output and logs, where highlighting would mislead.
                        </>,
                    ]}
                    donts={[
                        <>Don&rsquo;t use inline code for emphasis.</>,
                        <>Don&rsquo;t explain a snippet in prose that the reader has to match back to lines.</>,
                        <>Don&rsquo;t expect shell blocks to be highlighted - they render in a single colour.</>,
                    ]}
                />
            </Block>
        </Section>
    );
};
