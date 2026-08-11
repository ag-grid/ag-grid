import { CHARTS_ICON_MAP, ICON_MAP, Icon, SOCIALS_ICON_MAP } from '@ag-website-shared/components/icon/Icon';
import type { IconName } from '@ag-website-shared/components/icon/Icon';
import type { CSSProperties, FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { useStyleGuide, useTokens } from '../StyleGuideContext';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Guidance, Section } from '../chrome/Section';
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
                <>
                    <p>
                        Icons come from the <code>Icon</code> component, which renders an inline SVG so it inherits
                        colour and can be sized with CSS. The library is IBM Carbon plus bespoke marks for things Carbon
                        does not cover.
                    </p>
                    <p>
                        Two custom properties control appearance: <code>--icon-size</code> and <code>--icon-color</code>
                        . Set them on an ancestor rather than styling the SVG - that is how buttons and links give their
                        icons the right colour and hover behaviour for free.
                    </p>
                </>
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

            <Block
                title="Usage"
                note={
                    <p>
                        Icons are decorative by default. If an icon is the only content of a control, the control needs
                        an accessible name of its own.
                    </p>
                }
            >
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

            <Block title="Using icons">
                <Guidance
                    dos={[
                        <>
                            Set <code>--icon-color</code> on the containing element so hover states cascade to the icon
                            without a second rule.
                        </>,
                        <>
                            Give an icon-only control an <code>aria-label</code>. The SVG carries no accessible name.
                        </>,
                        <>
                            Pair an icon with a text label wherever the meaning is not universal - an icon alone is
                            rarely as unambiguous as it looks to the person who chose it.
                        </>,
                    ]}
                    donts={[
                        <>
                            Don&rsquo;t target the <code>svg</code> directly to change its colour; use{' '}
                            <code>--icon-color</code> so every state follows.
                        </>,
                        <>
                            Don&rsquo;t recolour a third-party brand mark. Use the monochrome variant where one exists,
                            such as <code>stackoverflowMonochrome</code>.
                        </>,
                        <>
                            Don&rsquo;t add an icon to the library for one use. Check Carbon first - most needs are
                            already covered by a name that is not yet mapped.
                        </>,
                    ]}
                />
            </Block>
        </Section>
    );
};
