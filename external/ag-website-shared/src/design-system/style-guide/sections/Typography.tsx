import classnames from 'classnames';
import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { useStyleGuide, useTokens } from '../StyleGuideContext';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Gotcha, KnownIssue, Section } from '../chrome/Section';
import { Specimen, Variant } from '../chrome/Specimen';
import { TokenTable } from '../chrome/TokenTable';

const SPECIMEN_TEXT = 'The quick brown fox jumps over the lazy dog';

/**
 * The type scale, in the order it should be read.
 *
 * `heading` records which tag `_typography.scss` maps to each step. That mapping is the thing most
 * worth writing down: it means picking `h3` for document structure also picks 20px, so structure
 * and size are coupled unless you override with a `.text-*` class.
 */
const SCALE = [
    { key: '2xs', heading: undefined, use: 'Dense metadata: table sub-labels, badge text.' },
    { key: 'xs', heading: 'h6', use: 'Captions, footnotes, code annotations.' },
    { key: 'sm', heading: 'h5', use: 'Secondary body text, form labels, table cells.' },
    { key: 'base', heading: 'h4', use: 'Default body text. Set on html, so this is what you get by default.' },
    { key: 'lg', heading: 'h3', use: 'Sub-section headings and lead paragraphs.' },
    { key: 'xl', heading: 'h2', use: 'Section headings.' },
    { key: '2xl', heading: 'h1', use: 'Page titles.' },
    { key: '3xl', heading: undefined, use: 'Hero and landing-page display text.' },
] as const;

const WEIGHTS = [
    {
        token: '--text-regular',
        label: 'Regular',
        use: 'Body copy. Also the weight of a heading carrying .text-regular.',
    },
    { token: '--text-semibold', label: 'Semibold', use: 'Links, emphasised labels, table headers.' },
    { token: '--text-bold', label: 'Bold', use: 'The default for every heading and for b / strong.' },
] as const;

/**
 * Typography reference: families, the size scale with its line heights, weights, and the vertical
 * rhythm the global styles apply to prose.
 */
export const Typography: FunctionComponent = () => {
    const { tokensByName } = useStyleGuide();
    const families = useTokens('--text-font-family').concat(useTokens('--text-monospace-font-family'));
    const sizes = useTokens('--text-fs-');
    const lineHeights = useTokens('--text-lh-');
    const weights = useTokens('--text-regular').concat(useTokens('--text-semibold')).concat(useTokens('--text-bold'));

    return (
        <Section
            id="typography"
            title="Typography"
            source={['_root.scss', '_typography.scss']}
            lede={
                <p>
                    Fixed px sizes, each paired with its own line height. There is no fluid type, so a heading is the
                    same size on mobile as on desktop.
                </p>
            }
        >
            <Block title="Families">
                <Specimen label="Body">
                    <p className={styles.familySpecimen}>{SPECIMEN_TEXT}</p>
                </Specimen>
                <Specimen label="Monospace">
                    <p className={classnames('text-monospace', styles.familySpecimen)}>{SPECIMEN_TEXT} 0123456789</p>
                </Specimen>
                <TokenTable tokens={families} withoutSwatch />
            </Block>

            <Block
                title="Scale"
                note={
                    <p>
                        The <code>Tag</code> column is the heading mapped to that step globally - so the tag you pick
                        for document structure also picks the size. The <code>Class</code> column changes size without
                        changing the tag.
                    </p>
                }
            >
                <div className={styles.tableScroll}>
                    <table className={styles.tokenTable}>
                        <thead>
                            <tr>
                                <th scope="col">Step</th>
                                <th scope="col">Size</th>
                                <th scope="col">Line height</th>
                                <th scope="col">Tag</th>
                                <th scope="col">Class</th>
                                <th scope="col">Sample</th>
                                <th scope="col">Use for</th>
                            </tr>
                        </thead>
                        <tbody>
                            {SCALE.map(({ key, heading, use }) => {
                                const size = tokensByName.get(`--text-fs-${key}`);
                                const lineHeight = tokensByName.get(`--text-lh-${key}`);
                                const computedSize = size?.substituted.light;
                                const computedLh = lineHeight?.substituted.light;

                                return (
                                    <tr key={key}>
                                        <td data-column="Step">
                                            <strong>{key}</strong>
                                        </td>
                                        <td data-column="Size">
                                            <CopyButton value={`var(--text-fs-${key})`} label={computedSize} inline />
                                        </td>
                                        <td data-column="Line height">
                                            <CopyButton value={`var(--text-lh-${key})`} label={computedLh} inline />
                                        </td>
                                        <td data-column="Tag">
                                            {heading ? (
                                                <code>{heading}</code>
                                            ) : (
                                                <span className={styles.tokenInherited}>none</span>
                                            )}
                                        </td>
                                        <td data-column="Class">
                                            <CopyButton value={`text-${key}`} label={`.text-${key}`} inline />
                                        </td>
                                        <td data-column="Sample">
                                            <span
                                                className={styles.scaleSample}
                                                style={{
                                                    fontSize: `var(--text-fs-${key})`,
                                                    lineHeight: `var(--text-lh-${key})`,
                                                }}
                                            >
                                                {SPECIMEN_TEXT}
                                            </span>
                                        </td>
                                        <td data-column="Use for">{use}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Block>

            <Block
                title="Weights"
                note={
                    <p>
                        Headings and <code>b</code> / <code>strong</code> resolve to <code>--text-bold</code> by
                        default. The three weight classes override that, and because they are classes they win over the
                        tag-level rule - so <code>&lt;h2 class=&quot;text-regular&quot;&gt;</code> really is 400.
                    </p>
                }
            >
                <Specimen row>
                    {WEIGHTS.map(({ token, label, use }) => (
                        <Variant key={token} name={label}>
                            <p style={{ fontWeight: `var(${token})`, fontSize: 'var(--text-fs-lg)' }}>
                                {SPECIMEN_TEXT}
                            </p>
                            <p className={styles.variantNote}>{use}</p>
                        </Variant>
                    ))}
                </Specimen>
                <TokenTable tokens={weights} withoutSwatch />
            </Block>

            <Block
                title="Line heights"
                note={
                    <p>
                        <code>--text-lh-tight</code> and <code>--text-lh-ultra-tight</code> are standalone, for
                        single-line contexts such as table cells and tab labels.
                    </p>
                }
            >
                <TokenTable tokens={lineHeights} withoutSwatch />
            </Block>

            <Block title="Sizes">
                <TokenTable tokens={sizes} withoutSwatch />
            </Block>

            <Block
                title="Prose rhythm"
                note={<p>Applied globally, so you should not need to add margins to prose yourself.</p>}
            >
                <Specimen
                    code={`h1..h6 + sibling   margin-bottom: $spacing-size-2   (8px)
p, ul, ol, blockquote   margin-bottom: $spacing-size-5   (20px)
ul, ol (nested)         margin-top: $spacing-size-2      (8px)
li + li                 margin-bottom: $spacing-size-2   (8px)`}
                >
                    <h3>A heading, followed by prose</h3>
                    <p>
                        The gap above is 8px because a heading sits tight to the text it introduces. The gap between
                        this paragraph and the next is 20px.
                    </p>
                    <p>
                        A second paragraph, to show the paragraph rhythm. Lists take the same 20px from surrounding
                        prose but only 8px between their own items.
                    </p>
                    <ul>
                        <li>First item</li>
                        <li>Second item</li>
                    </ul>
                </Specimen>
            </Block>

            <Gotcha>
                Never skip a heading level to get a size - pick the tag for the document outline and correct the size
                with a <code>.text-*</code> class. The size and line-height of a step are tuned together, so don&rsquo;t
                mix one step&rsquo;s size with another&rsquo;s line height.
            </Gotcha>

            <KnownIssue>
                <p>
                    Two line heights are out of pattern with their neighbours. <code>--text-lh-2xl</code> is 1.5 while
                    every other heading-sized step is between 1.1 and 1.2, so <code>h1</code> sits on a noticeably
                    looser line than the smaller headings or the larger <code>3xl</code> display size. And{' '}
                    <code>--text-lh-xs</code> is 1.6666 against 1.4 for <code>sm</code> and <code>base</code>, making
                    the smallest body step the loosest one.
                </p>
                <p>
                    In <code>_typography.scss</code> the heading and <code>b</code>/<code>strong</code> selectors are
                    repeated in all three weight rules, so the first two declarations are dead - only{' '}
                    <code>--text-bold</code> ever applies to a bare heading.
                </p>
            </KnownIssue>
        </Section>
    );
};
