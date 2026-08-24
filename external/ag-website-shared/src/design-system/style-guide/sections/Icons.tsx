import { EnterpriseIcon } from '@ag-website-shared/components/icon/EnterpriseIcon';
import { CHARTS_ICON_MAP, ICON_MAP, Icon, SOCIALS_ICON_MAP } from '@ag-website-shared/components/icon/Icon';
import type { IconName } from '@ag-website-shared/components/icon/Icon';
import { LinkIcon } from '@ag-website-shared/components/link-icon/LinkIcon';
import type { CSSProperties, FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { useStyleGuide, useTokens } from '../StyleGuideContext';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Gotcha, KnownIssue, Section } from '../chrome/Section';
import { Specimen, Variant } from '../chrome/Specimen';
import { TokenTable } from '../chrome/TokenTable';

const SOCIAL_NAMES = new Set(Object.keys(SOCIALS_ICON_MAP));
const CHART_NAMES = new Set(Object.keys(CHARTS_ICON_MAP));

const GROUPS: { title: string; note: string; names: IconName[] }[] = [
    {
        title: 'Interface',
        note: 'General purpose icons for navigation, actions and status. Drawn from IBM Carbon, with a few bespoke additions.',
        names: (Object.keys(ICON_MAP) as IconName[]).filter(
            (name) => !SOCIAL_NAMES.has(name) && !CHART_NAMES.has(name)
        ),
    },
    {
        title: 'Social and external services',
        note: 'Third-party brand marks. These are brand assets - do not recolour them beyond the monochrome variants provided.',
        names: Object.keys(SOCIALS_ICON_MAP) as IconName[],
    },
    {
        title: 'Chart types',
        note: 'One per AG Charts series type, used by the gallery and the charts documentation navigation.',
        names: Object.keys(CHARTS_ICON_MAP) as IconName[],
    },
];

/** The icon library, plus the two custom properties that control icon size and colour. */
export const Icons: FunctionComponent = () => {
    const { filter } = useStyleGuide();
    const iconTokens = useTokens('--icon-');
    const needle = filter.trim().toLowerCase();

    return (
        <Section
            id="icons"
            title="Icons"
            source={['components/icon/Icon.tsx', '_root.scss']}
            lede={
                <p>
                    IBM Carbon plus bespoke marks, rendered as inline SVG. <code>--icon-size</code> and{' '}
                    <code>--icon-color</code> control appearance - set them on an ancestor rather than styling the SVG.
                </p>
            }
        >
            <Block
                title="Tokens"
                note={
                    <p>
                        <code>--icon-color</code> is not declared at the root - it is set by whatever context the icon
                        sits in, which is why an icon in a button is already the right colour.
                    </p>
                }
            >
                <TokenTable tokens={iconTokens} withoutSwatch />
            </Block>

            <Block title="Usage">
                <Specimen label="Inheriting colour from the context" row code={`<Icon name="eye" />`}>
                    <Variant name="In text">
                        <span>
                            Visible <Icon name="eye" />
                        </span>
                    </Variant>
                    <Variant name="In a link">
                        <a href="#icons">
                            Open <Icon name="newTab" />
                        </a>
                    </Variant>
                    <Variant name="In a button">
                        <button type="button">
                            Run <Icon name="play" />
                        </button>
                    </Variant>
                    <Variant name="Icon only">
                        <button type="button" className="button-secondary" aria-label="Copy to clipboard">
                            <Icon name="copy" />
                        </button>
                    </Variant>
                </Specimen>

                <Specimen
                    label="Overriding size and colour"
                    row
                    code={`.myComponent {
    --icon-size: 24px;
    --icon-color: var(--color-brand-500);
}`}
                >
                    <Variant name="16px">
                        <span style={{ '--icon-size': '16px' } as CSSProperties}>
                            <Icon name="alarm" />
                        </span>
                    </Variant>
                    <Variant name="Default (32px)">
                        <Icon name="alarm" />
                    </Variant>
                    <Variant name="48px">
                        <span style={{ '--icon-size': '48px' } as CSSProperties}>
                            <Icon name="alarm" />
                        </span>
                    </Variant>
                    <Variant name="Brand coloured">
                        <span style={{ '--icon-color': 'var(--color-brand-500)' } as CSSProperties}>
                            <Icon name="alarm" />
                        </span>
                    </Variant>
                </Specimen>
            </Block>

            {GROUPS.map(({ title, note, names }) => {
                const visible = names.filter((name) => needle === '' || name.toLowerCase().includes(needle));

                return (
                    <Block key={title} title={`${title} (${names.length})`} note={<p>{note}</p>}>
                        {visible.length === 0 ? (
                            <p className={styles.emptyState}>No icons match the current filter.</p>
                        ) : (
                            <div className={styles.iconGrid}>
                                {visible.map((name) => (
                                    <div key={name} className={styles.iconCell}>
                                        <Icon name={name} />
                                        <CopyButton value={name} inline className={styles.iconName} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Block>
                );
            })}

            <Block
                title="Composed icons"
                note={
                    <p>
                        Two components wrap <code>Icon</code> with meaning attached, so the meaning stays consistent
                        across the sites. Use these rather than reaching for the underlying icon name.
                    </p>
                }
            >
                <Specimen
                    label={
                        <>
                            <code>EnterpriseIcon</code> - marks a feature as Enterprise-only
                        </>
                    }
                    code={`<EnterpriseIcon />

{/* markdoc */}
Row grouping {% enterpriseIcon /%} requires an Enterprise licence.`}
                >
                    <p>
                        Row grouping <EnterpriseIcon /> requires an Enterprise licence.
                    </p>
                </Specimen>
                <p>
                    It renders the literal text <code>(e)</code> beside the icon, and the CSS hides one of the two
                    depending on context - so the mark degrades to something readable rather than vanishing. Its only
                    prop is <code>style</code>, which accepts a JSON <em>string</em> as well as an object, because
                    markdoc attributes can only be strings.
                </p>

                <Specimen
                    label={
                        <>
                            <code>LinkIcon</code> - the click-to-copy anchor on a heading
                        </>
                    }
                    code={`<h3 id="my-section">
    My section
    <LinkIcon href="#my-section" />
</h3>`}
                >
                    <h4 className={styles.linkIconDemo}>
                        Hover this heading to reveal it <LinkIcon href="#icons" />
                    </h4>
                </Specimen>
                <p>
                    Copies the absolute URL to the clipboard, updates the address bar with{' '}
                    <code>history.replaceState</code> so no history entry is added, and swaps its tooltip to &ldquo;Link
                    copied!&rdquo;. It is hidden at <code>opacity: 0</code> until the heading is hovered, which is why
                    it has to be inside the heading element rather than beside it - and it is what puts the copy links
                    on the section headings in this guide. Passing <code>exampleLink</code> switches it to the{' '}
                    <code>OpenInCTA</code> styling instead, for the row of controls above a code example.
                </p>
            </Block>

            <Gotcha>
                The SVG carries no accessible name, so an icon-only control needs an <code>aria-label</code>. Change
                colour through <code>--icon-color</code> rather than targeting the <code>svg</code>, or hover states
                stop following. Don&rsquo;t recolour a third-party brand mark - use the monochrome variant where one
                exists, such as <code>stackoverflowMonochrome</code>.
            </Gotcha>

            <KnownIssue>
                <p>
                    Every <code>LinkIcon</code> on a page has the same <code>aria-label</code>, the literal string{' '}
                    <code>&quot;Heading link&quot;</code>. A screen-reader user listing a documentation page&rsquo;s
                    links hears it once per heading with nothing to distinguish them, when the heading text it sits
                    inside is right there to use.
                </p>
                <p>
                    Its tooltip is revealed on <code>:hover</code> and while <code>.active</code>, but not on{' '}
                    <code>:focus-visible</code> - which the icon itself is. A keyboard user sees the control appear and
                    can activate it, but never sees the label that says what activating it does.
                </p>
            </KnownIssue>
        </Section>
    );
};
