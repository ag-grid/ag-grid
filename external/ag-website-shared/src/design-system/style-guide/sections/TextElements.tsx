import { Icon } from '@ag-website-shared/components/icon/Icon';
import type { FunctionComponent, ReactNode } from 'react';

import styles from '../StyleGuide.module.scss';
import { Block, Gotcha, KnownIssue, Section } from '../chrome/Section';
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
            <p>
                Styled globally by tag, so semantic HTML renders correctly with no classes. Pick the tag that describes
                what the content <em>is</em>; the styling follows.
            </p>
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

        <Gotcha>
            <code>b</code>/<code>i</code> render identically to <code>strong</code>/<code>em</code> here but do not mean
            the same thing, so pick by meaning. Avoid <code>u</code> entirely - underlined text that is not a link is a
            usability problem and the system gives no visual distinction between the two. The Mac variant of{' '}
            <code>kbd</code> is handled for you by the <code>.kbd-mac</code> / <code>.kbd-default</code> pair.
        </Gotcha>
    </Section>
);

/** Links, including the icon-bearing and pseudo-link variants. */
export const Links: FunctionComponent = () => (
    <Section
        id="links"
        title="Links"
        source={['elements/_inline.scss', 'elements/_button.scss']}
        lede={
            <p>
                <code>--color-link</code> at <code>--text-semibold</code>, no underline. Links also set{' '}
                <code>--icon-color</code>, so an icon inside one follows the link colour and its hover state.
            </p>
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
            note={<p>The choice is about behaviour, not appearance - which is why both look like links.</p>}
        >
            <div className={styles.tableScroll}>
                <table className={styles.tokenTable}>
                    <thead>
                        <tr>
                            <th scope="col">Use</th>
                            <th scope="col">When the result is</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td data-column="Use">
                                <code>&lt;a href&gt;</code>
                            </td>
                            <td data-column="When the result is">
                                A new location - another page, or an anchor on this one.
                            </td>
                        </tr>
                        <tr>
                            <td data-column="Use">
                                <code>&lt;button class=&quot;button-as-link&quot;&gt;</code>
                            </td>
                            <td data-column="When the result is">
                                An action on this page - expanding a section, opening a dialog, copying something.
                            </td>
                        </tr>
                        <tr>
                            <td data-column="Use">
                                <code>.meta-link</code>
                            </td>
                            <td data-column="When the result is">
                                A cross-reference to an API member, where the link is an identifier rather than a
                                phrase.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Block>

        <Gotcha>
            An <code>&lt;a&gt;</code> with no <code>href</code> is not focusable or keyboard-operable, so never use one
            for an action. Colour and weight together distinguish a link, which means inside a heading or other bold
            text it is left carrying colour alone - check it still reads.
        </Gotcha>

        <KnownIssue>
            <p>
                Link colours are still marked <code>// TODO, review &amp; replace color</code>. In light mode{' '}
                <code>--color-link</code> is <code>--color-brand-500</code>; check its contrast row in the colour
                section before using it on anything other than <code>--color-bg-primary</code>.
            </p>
        </KnownIssue>
    </Section>
);
