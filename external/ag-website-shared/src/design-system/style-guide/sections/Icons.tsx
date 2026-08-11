import { CHARTS_ICON_MAP, ICON_MAP, Icon, SOCIALS_ICON_MAP } from '@ag-website-shared/components/icon/Icon';
import type { IconName } from '@ag-website-shared/components/icon/Icon';
import type { CSSProperties, FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { useStyleGuide, useTokens } from '../StyleGuideContext';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Gotcha, Section } from '../chrome/Section';
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

            <Gotcha>
                The SVG carries no accessible name, so an icon-only control needs an <code>aria-label</code>. Change
                colour through <code>--icon-color</code> rather than targeting the <code>svg</code>, or hover states
                stop following. Don&rsquo;t recolour a third-party brand mark - use the monochrome variant where one
                exists, such as <code>stackoverflowMonochrome</code>.
            </Gotcha>
        </Section>
    );
};
