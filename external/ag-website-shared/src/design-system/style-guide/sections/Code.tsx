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
                title="Highlighting engine"
                note={
                    <>
                        <p>
                            Highlighted snippets go through{' '}
                            <a href="https://shiki.style/" target="_blank" rel="noreferrer">
                                Shiki
                            </a>
                            , not a stylesheet of <code>.token</code> classes. One shared highlighter is created at
                            module load in <code>components/code/Code.tsx</code> for a fixed list of fourteen languages,
                            and each result is memoised on the language plus the source text.
                        </p>
                        <p>
                            The theming trick lives in <code>components/code/theme.json</code>. The <code>ag-docs</code>{' '}
                            theme sets every scope&rsquo;s <code>foreground</code> to a <code>var()</code> reference
                            instead of a hex colour, and Shiki copies those strings straight into the inline{' '}
                            <code>style</code> of each token span - so the browser resolves them at paint time.
                        </p>
                        <p>
                            That is why changing theme never re-highlights anything. The markup is theme-agnostic, so
                            redefining <code>--color-code-*</code> in the dark-mode block re-colours every snippet
                            already on the page, and the docs can ship highlighted HTML from the build and reuse it
                            as-is.
                        </p>
                        <p>
                            It also explains a CSP rule: Shiki&rsquo;s regex engine is WebAssembly, so docs pages need{' '}
                            <code>&apos;wasm-unsafe-eval&apos;</code>, and the inline token styles need{' '}
                            <code>style-src &apos;unsafe-inline&apos;</code>.
                        </p>
                    </>
                }
            >
                <Specimen
                    label="The theme names a custom property..."
                    code={`{
    "name": "ag-docs",
    "tokenColors": [
        { "scope": "keyword", "settings": { "foreground": "var(--color-code-keyword)" } },
        { "scope": "comment", "settings": { "foreground": "var(--color-code-comment)" } }
    ]
}`}
                />
                <Specimen
                    label="...so the emitted span carries the variable, not a colour"
                    code={`<span style="color:var(--color-code-keyword)">const</span>`}
                />
            </Block>

            <Block
                title="Syntax colours"
                note={
                    <>
                        <p>
                            Hand-tuned per theme rather than re-pointed at the palette - highlighting needs hue
                            separation a neutral scale cannot give. Contrast is against{' '}
                            <code>--color-code-background</code>.
                        </p>
                        <p>
                            <code>--color-code-background</code> is the exception: it is a <code>color-mix()</code> of
                            two background tokens that already flip with the theme, so it needs no dark-mode override of
                            its own.
                        </p>
                    </>
                }
            >
                <TokenTable tokens={codeColours} contrastAgainst={codeBackground} />
            </Block>

            <Gotcha>
                <code>&lt;code&gt;</code> means &ldquo;a literal you would type&rdquo;, not &ldquo;this is
                important&rdquo; - don&rsquo;t use it for emphasis. Explain a line with a comment inside the snippet
                rather than prose after it, so the explanation travels with the code when it is copied.
            </Gotcha>

            <Gotcha>
                Bash and shell blocks render flat on purpose - <code>CodeHighlight.module.scss</code> forces every token
                in a <code>language-bash</code> or <code>language-shell</code> block back to{' '}
                <code>--color-fg-primary</code> with <code>!important</code>, so editing the code palette will not
                change them.
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
                <p>
                    <code>components/_code.scss</code> still carries 65 <code>.token</code> selectors from the Prism
                    era. Prism is no longer a dependency and Shiki emits inline styles and <code>.line</code> spans, so
                    none of them match anything. <code>--color-code-important</code> is reachable only from that dead
                    block and is never named by <code>theme.json</code>, which is why it is the one{' '}
                    <code>--color-code-*</code> token carrying the same value in both themes.
                </p>
                <p>
                    The CSP comment explaining the WebAssembly exemption points at <code>CodeShiki.tsx</code>, which
                    does not exist - the component is <code>components/code/Code.tsx</code>.
                </p>
            </KnownIssue>
        </Section>
    );
};
