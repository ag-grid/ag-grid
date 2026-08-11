import { Snippet } from '@ag-website-shared/components/snippet/Snippet';
import type { FunctionComponent } from 'react';

import { useStyleGuide, useTokens } from '../StyleGuideContext';
import { Block, Guidance, KnownIssue, Section } from '../chrome/Section';
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
                <>
                    <p>
                        Three levels, in increasing weight: <code>&lt;code&gt;</code> for an identifier in a sentence,{' '}
                        <code>&lt;pre&gt;</code> for a literal block with no highlighting, and the <code>Snippet</code>{' '}
                        component for source that should be syntax highlighted and copyable.
                    </p>
                    <p>
                        Syntax highlighting uses Prism token classes mapped onto <code>--color-code-*</code> tokens.
                        Those are the only colours in the system hand-tuned per theme rather than re-pointed at the
                        palette, because highlighting needs hue separation a neutral scale cannot provide.
                    </p>
                </>
            }
        >
            <Block
                title="Inline"
                note={
                    <p>
                        <code>&lt;code&gt;</code> renders at <code>0.875em</code> of its context, so it stays
                        proportional inside a heading as well as in body text. Use it for anything the reader would type
                        or find in an API: option names, values, file paths, class names.
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
                        <code>&lt;pre&gt;</code> preserves whitespace and applies the monospace family, a border and the
                        secondary background - but no highlighting. Use it for output, logs, directory trees and
                        configuration fragments where highlighting would be misleading.
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

            <Block
                title="Highlighted snippets"
                note={
                    <p>
                        The <code>Snippet</code> component wraps <code>Code</code>, which renders <code>pre.code</code>.
                        It handles framework transformation, optional line numbers and the copy-to-clipboard control.
                    </p>
                }
            >
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
                        Contrast is measured against <code>--color-code-background</code>, which is the surface these
                        colours actually sit on. Comments and punctuation are the ones to watch - they are the lowest
                        contrast by design and the easiest to push too far.
                    </p>
                }
            >
                <TokenTable tokens={codeColours} contrastAgainst={codeBackground} />
            </Block>

            <Block title="Presenting code">
                <Guidance
                    dos={[
                        <>
                            Use <code>Snippet</code> for anything a reader might copy, and turn on{' '}
                            <code>copyToClipboard</code> when they almost certainly will.
                        </>,
                        <>
                            Keep snippets to the lines that matter. A full file forces the reader to work out which part
                            is the point.
                        </>,
                        <>
                            Use a comment inside the snippet to explain a line, rather than prose after it - the comment
                            travels with the code when it is copied.
                        </>,
                    ]}
                    donts={[
                        <>
                            Don&rsquo;t use <code>&lt;code&gt;</code> for emphasis. It means &ldquo;this is a literal
                            you would type&rdquo;, not &ldquo;this is important&rdquo;.
                        </>,
                        <>
                            Don&rsquo;t turn on line numbers unless you refer to the numbers; they add noise and make
                            the snippet harder to copy cleanly.
                        </>,
                        <>
                            Don&rsquo;t nest <code>&lt;code&gt;</code> inside <code>&lt;pre&gt;</code> by hand - the
                            inline styling will fight the block styling.
                        </>,
                    ]}
                />
            </Block>

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
