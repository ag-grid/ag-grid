import { Icon } from '@ag-website-shared/components/icon/Icon';
import type { FunctionComponent, ReactNode } from 'react';

import styles from '../StyleGuide.module.scss';
import { Block, Guidance, KnownIssue, Section } from '../chrome/Section';
import { Specimen, Variant } from '../chrome/Specimen';

/**
 * The inline elements the design system styles globally.
 *
 * `note` is the part that earns its place - it says what each element *means*, not just that it is
 * styled. `<em>` versus `<i>` and `<del>` versus `<s>` are chosen for meaning, and a style guide
 * that only shows the rendering encourages picking whichever looks right.
 */
const INLINE_ELEMENTS: { tag: string; render: ReactNode; note: string }[] = [
    { tag: 'strong', render: <strong>Important</strong>, note: 'Strong importance. Renders at --text-bold.' },
    {
        tag: 'b',
        render: <b>Stands out</b>,
        note: 'Draws attention without implying importance. Same weight as strong.',
    },
    { tag: 'em', render: <em>Emphasis</em>, note: 'Stress emphasis - changes the meaning of the sentence.' },
    { tag: 'i', render: <i>Alternate voice</i>, note: 'A term, a name, a phrase in another language.' },
    { tag: 'u', render: <u>Annotated</u>, note: 'Non-textual annotation. Avoid - reads as a link.' },
    { tag: 'del', render: <del>Removed</del>, note: 'Content removed from the document.' },
    { tag: 'ins', render: <ins>Added</ins>, note: 'Content added to the document.' },
    { tag: 's', render: <s>No longer accurate</s>, note: 'No longer relevant, but not an edit.' },
    { tag: 'small', render: <small>Side comment</small>, note: 'Small print: disclaimers, legal notes.' },
    {
        tag: 'sub',
        render: (
            <>
                H<sub>2</sub>O
            </>
        ),
        note: 'Subscript.',
    },
    {
        tag: 'sup',
        render: (
            <>
                24<sup>th</sup>
            </>
        ),
        note: 'Superscript.',
    },
    {
        tag: 'abbr',
        render: (
            <abbr title="Cascading Style Sheets" data-tooltip="Cascading Style Sheets">
                CSS
            </abbr>
        ),
        note: 'Abbreviation. Always give a title so the expansion is available.',
    },
    { tag: 'mark', render: <mark>Highlighted</mark>, note: 'Relevance in the current context, e.g. a search hit.' },
    { tag: 'kbd', render: <kbd>Ctrl</kbd>, note: 'A key or key combination. Styled as a physical key.' },
    { tag: 'code', render: <code>getRowId</code>, note: 'An inline code fragment, identifier or token name.' },
    { tag: 'a', render: <a href="#text-elements">A link</a>, note: 'Brand coloured and semibold, no underline.' },
];

/** Text elements and lists. */
export const TextElements: FunctionComponent = () => (
    <Section
        id="text-elements"
        title="Text elements"
        source={['elements/_inline.scss', 'elements/_block.scss']}
        lede={
            <>
                <p>
                    Inline and block text elements are styled globally by tag, so semantic HTML renders correctly with
                    no classes. Pick the tag that describes what the content <em>is</em>; the styling follows.
                </p>
                <p>
                    All of these selectors are guarded with <code>:where(:not([class^=ag]))</code> so they cannot leak
                    into a rendered grid on the same page. That guard is why the global styles are safe on documentation
                    pages that embed live examples.
                </p>
            </>
        }
    >
        <Block title="Inline elements">
            <div className={styles.tableScroll}>
                <table className={styles.tokenTable}>
                    <thead>
                        <tr>
                            <th scope="col">Tag</th>
                            <th scope="col">Renders as</th>
                            <th scope="col">Means</th>
                        </tr>
                    </thead>
                    <tbody>
                        {INLINE_ELEMENTS.map(({ tag, render, note }) => (
                            <tr key={tag}>
                                <td data-column="Tag">
                                    <code>&lt;{tag}&gt;</code>
                                </td>
                                <td data-column="Renders as">{render}</td>
                                <td data-column="Means">{note}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Block>

        <Block
            title="In running text"
            note={<p>The same elements in prose, which is where their weight and colour actually have to work.</p>}
        >
            <Specimen>
                <p>
                    Setting <code>getRowId</code> is <strong>strongly recommended</strong> when your data has a stable
                    identifier - it lets the grid track rows across updates rather than re-creating them. The{' '}
                    <em>immutable</em> data path depends on it, and without it row state such as selection is{' '}
                    <del>preserved</del> <ins>lost</ins> on every refresh.
                </p>
                <p>
                    Press <kbd>Ctrl</kbd> <kbd>C</kbd> to copy the selected range. On macOS the shortcut is{' '}
                    <kbd>Cmd</kbd> <kbd>C</kbd>. <small>Clipboard access requires a secure context.</small>
                </p>
            </Specimen>
        </Block>

        <Block title="Lists">
            <Specimen label="Unordered" code={`<ul>`}>
                <ul>
                    <li>Columns are defined once and reused across grids.</li>
                    <li>
                        Nested lists indent by 1.5em and tighten their own item spacing.
                        <ul>
                            <li>A nested item.</li>
                            <li>Another nested item.</li>
                        </ul>
                    </li>
                    <li>The last item contributes no bottom margin.</li>
                </ul>
            </Specimen>
            <Specimen label="Ordered" code={`<ol>`}>
                <ol>
                    <li>Install the package.</li>
                    <li>Register the modules you need.</li>
                    <li>Create the grid.</li>
                </ol>
            </Specimen>
            <Specimen label="Unstyled" code={`<ul class="list-style-none">`}>
                <ul className="list-style-none">
                    <li>No marker and no indent.</li>
                    <li>Item spacing is removed too, so use this for layout lists.</li>
                    <li>Nested lists inside it are also unstyled.</li>
                </ul>
            </Specimen>
        </Block>

        <Block title="Rules and preformatted blocks">
            <Specimen label="Horizontal rule" code={`<hr />`}>
                <hr />
            </Specimen>
            <Specimen label="Preformatted" code={`<pre>`}>
                <pre>{`columnDefs: [
    { field: 'athlete', pinned: 'left' },
    { field: 'country', rowGroup: true },
]`}</pre>
            </Specimen>
        </Block>

        <Block title="Writing content">
            <Guidance
                dos={[
                    <>
                        Use <code>strong</code> for importance and <code>em</code> for stress. Both render distinctly
                        and both are announced by screen readers.
                    </>,
                    <>
                        Give every <code>abbr</code> a <code>title</code>, and mirror it in <code>data-tooltip</code> so
                        it shows on hover.
                    </>,
                    <>
                        Use <code>kbd</code> for keys. The Mac variant is handled for you - see the{' '}
                        <code>.kbd-mac</code> / <code>.kbd-default</code> pair in <code>elements/_inline.scss</code>.
                    </>,
                ]}
                donts={[
                    <>
                        Don&rsquo;t use <code>u</code>. Underlined text that is not a link is a usability problem, and
                        the system offers no visual distinction between the two.
                    </>,
                    <>
                        Don&rsquo;t use <code>b</code> or <code>i</code> where <code>strong</code> or <code>em</code>{' '}
                        carries the meaning - they render identically here but do not convey the same thing.
                    </>,
                    <>
                        Don&rsquo;t use <code>pre</code> for source code that should be highlighted; use the{' '}
                        <code>Snippet</code> component or <code>pre.code</code>.
                    </>,
                ]}
            />
        </Block>
    </Section>
);

/** Links, including the icon-bearing and pseudo-link variants. */
export const Links: FunctionComponent = () => (
    <Section
        id="links"
        title="Links"
        source={['elements/_inline.scss', 'elements/_button.scss']}
        lede={
            <>
                <p>
                    Links are <code>--color-link</code> and <code>--text-semibold</code> with no underline. Colour and
                    weight together do the work of distinguishing them, which means a link inside already-bold text is
                    identified by colour alone.
                </p>
                <p>
                    Links set <code>--icon-color</code> alongside their own colour, so an icon inside a link picks up
                    the link colour and its hover state automatically.
                </p>
            </>
        }
    >
        <Block title="Variants">
            <Specimen row>
                <Variant name="Default">
                    <a href="#links">Read the documentation</a>
                </Variant>
                <Variant name="With icon">
                    <a href="#links">
                        Open in new tab <Icon name="newTab" />
                    </a>
                </Variant>
                <Variant name="Button as link">
                    <button type="button" className="button-as-link">
                        Acts on the page
                    </button>
                </Variant>
                <Variant name="Meta link">
                    <a href="#links" className="meta-link">
                        <code>rowSelection</code>
                    </a>
                </Variant>
            </Specimen>
        </Block>

        <Block
            title="Link or button?"
            note={
                <p>
                    <code>.button-as-link</code> exists because the choice between <code>a</code> and{' '}
                    <code>button</code> is about behaviour, not appearance. Something that changes the page in place is
                    a button even when it should look like a link.
                </p>
            }
        >
            <Guidance
                dos={[
                    <>
                        Use <code>&lt;a href&gt;</code> when the result is a new location - a different page, or an
                        anchor on this one.
                    </>,
                    <>
                        Use <code>&lt;button class=&quot;button-as-link&quot;&gt;</code> when the result is an action:
                        expanding a section, opening a dialog, copying something.
                    </>,
                    <>
                        Use <code>.meta-link</code> for cross-references to an API member, where the link is an
                        identifier rather than a phrase.
                    </>,
                ]}
                donts={[
                    <>
                        Don&rsquo;t use an <code>&lt;a&gt;</code> without an <code>href</code> for an action - it is not
                        focusable or operable by keyboard.
                    </>,
                    <>
                        Don&rsquo;t write &ldquo;click here&rdquo;. The link text should make sense read on its own,
                        because that is how screen reader users navigate a page.
                    </>,
                    <>
                        Don&rsquo;t rely on colour alone to mark a link inside a heading or other bold text, where the
                        weight difference disappears.
                    </>,
                ]}
            />
        </Block>

        <KnownIssue>
            <p>
                Link colours are still marked <code>// TODO, review &amp; replace color</code>. In light mode{' '}
                <code>--color-link</code> is <code>--color-brand-500</code>; check its contrast row in the colour
                section before using it on anything other than <code>--color-bg-primary</code>.
            </p>
        </KnownIssue>
    </Section>
);
