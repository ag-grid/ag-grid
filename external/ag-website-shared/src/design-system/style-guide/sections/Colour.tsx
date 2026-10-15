import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { useStyleGuide, useTokens } from '../StyleGuideContext';
import { Block, Guidance, Section } from '../chrome/Section';
import { SwatchLegend } from '../chrome/Swatch';
import { ScaleStrip, TokenTable } from '../chrome/TokenTable';

const SCALES: { prefix: string; title: string; note: string }[] = [
    {
        prefix: '--color-gray-',
        title: 'Grey',
        note: 'Carries the whole neutral range: page backgrounds, borders and body text all resolve into this scale.',
    },
    {
        prefix: '--color-brand-',
        title: 'Brand',
        note: 'AG blue. 500 is the primary brand colour and the default for links, primary buttons and the site header.',
    },
    {
        prefix: '--color-warning-',
        title: 'Warning',
        note: 'Amber. Used by warning alerts and the warning utility scale.',
    },
    {
        prefix: '--color-green-',
        title: 'Green',
        note: 'Success states. Note that --color-success and --color-positive sit outside this scale.',
    },
    {
        prefix: '--color-dev-',
        title: 'Dev tools',
        note: 'Violet, reserved for internal developer tooling so it never reads as a product colour. Declared in oklch rather than hex.',
    },
];

/**
 * Colour reference: abstract palette, semantic roles, component tokens, and the contrast figures
 * for every pairing that carries text.
 *
 * Structured by token layer rather than by hue, because the layer is what decides which token you
 * should be using - a flat alphabetical list of 200 colour tokens tells you nothing about that.
 */
export const Colour: FunctionComponent = () => {
    const { tokensByName } = useStyleGuide();
    const bgPrimary = tokensByName.get('--color-bg-primary');
    const bgSecondary = tokensByName.get('--color-bg-secondary');

    const base = useTokens('--color-white').concat(useTokens('--color-black'));
    const backgrounds = useTokens('--color-bg-');
    const foregrounds = useTokens('--color-fg-');
    const text = useTokens('--color-text-');
    const borders = useTokens('--color-border-');
    const links = useTokens('--color-link');
    const buttons = useTokens('--color-button-');
    const inputs = useTokens('--color-input-');
    const utilities = useTokens('--color-util-');
    const code = useTokens('--color-code-');
    const logo = useTokens('--color-logo-');
    const status = useTokens('--color-success')
        .concat(useTokens('--color-positive'))
        .concat(useTokens('--color-negative'))
        .concat(useTokens('--color-enterprise-'));

    return (
        <Section
            id="colour"
            title="Colour"
            source="_root.scss"
            lede={
                <p>
                    Abstract values stay fixed across themes; semantic and component tokens re-point under{' '}
                    <code>html[data-dark-mode=&apos;true&apos;]</code>. Contrast is WCAG 2.1 against the resolved
                    background for that theme - 4.5:1 for body text, 3:1 for large text and non-text indicators.
                </p>
            }
        >
            <SwatchLegend />

            <Block title="Base">
                <TokenTable tokens={base} />
            </Block>

            {SCALES.map(({ prefix, title, note }) => (
                <Block key={prefix} title={`Abstract scale: ${title}`} note={<p>{note}</p>}>
                    <AbstractScale prefix={prefix} />
                </Block>
            ))}

            <Block
                title="Semantic: backgrounds"
                note={
                    <p>
                        <code>--color-bg-primary</code> is the page, <code>--color-bg-secondary</code> the recessed
                        surface. Reach for one of those two first - the rest are special cases.
                    </p>
                }
            >
                <TokenTable tokens={backgrounds} />
            </Block>

            <Block
                title="Semantic: foreground"
                note={<p>For icons, rules and any non-text mark. Running text has its own group below.</p>}
            >
                <TokenTable tokens={foregrounds} contrastAgainst={bgPrimary} />
            </Block>

            <Block
                title="Semantic: text"
                note={
                    <p>
                        <code>--color-text-primary</code> is the body default set on <code>html</code>; headings use{' '}
                        <code>--color-fg-primary</code> instead, so they differ in colour as well as size.
                    </p>
                }
            >
                <TokenTable tokens={text} contrastAgainst={bgPrimary} />
            </Block>

            <Block
                title="Semantic: borders"
                note={
                    <p>
                        Graded against 3:1 (WCAG 1.4.11), which matters most for input outlines where the border is the
                        only thing marking the control.
                    </p>
                }
            >
                <TokenTable tokens={borders} contrastAgainst={bgPrimary} largeText />
            </Block>

            <Block title="Semantic: links">
                <TokenTable tokens={links} contrastAgainst={bgPrimary} />
            </Block>

            <Block
                title="Component: buttons"
                note={<p>Three variants, each with background, hover, active, focus-ring, foreground and border.</p>}
            >
                <TokenTable tokens={buttons} />
            </Block>

            <Block title="Component: inputs">
                <TokenTable tokens={inputs} />
            </Block>

            <Block
                title="Utility scales"
                note={
                    <p>
                        The one group that <strong>inverts</strong> between themes - the strips below run in opposite
                        directions. 50 is always the subtle end and 700 the strong end, so a component works in both
                        themes without a dark-mode block.
                    </p>
                }
            >
                <UtilityScales />
                <TokenTable tokens={utilities} />
            </Block>

            <Block title="Code syntax" note={<p>Syntax highlighting colours. See the code section for them in use.</p>}>
                <TokenTable tokens={code} contrastAgainst={bgSecondary} />
            </Block>

            <Block
                title="Brand marks and status"
                note={<p>Logo colours are fixed brand assets and must not be re-pointed per theme.</p>}
            >
                <TokenTable tokens={logo.concat(status)} contrastAgainst={bgPrimary} />
            </Block>

            <Block title="Usage">
                <Guidance
                    dos={[
                        <>
                            Pick by role: <code>--color-bg-*</code> for a surface, <code>--color-fg-*</code> for a mark,{' '}
                            <code>--color-text-*</code> for running text, <code>--color-border-*</code> for an outline.
                        </>,
                        <>
                            Mix an in-between value from a token with <code>color-mix()</code>, so it still follows the
                            theme.
                        </>,
                        <>Check a new pairing&rsquo;s contrast in both themes.</>,
                    ]}
                    donts={[
                        <>
                            Don&rsquo;t use <code>--color-gray-*</code> or another abstract scale directly - the
                            semantic token already picks the right step for each theme.
                        </>,
                        <>Don&rsquo;t write a literal hex value. It follows neither the theme nor a palette change.</>,
                        <>Don&rsquo;t re-colour a logo for dark mode.</>,
                    ]}
                />
            </Block>
        </Section>
    );
};

/** One abstract scale, as a strip. Abstract values do not change per theme, so one strip is enough. */
const AbstractScale: FunctionComponent<{ prefix: string }> = ({ prefix }) => {
    const tokens = useTokens(prefix);

    if (tokens.length === 0) {
        return <p className={styles.emptyState}>No tokens match the current filter.</p>;
    }

    return (
        <>
            <ScaleStrip tokens={tokens} theme="light" />
            <TokenTable tokens={tokens} />
        </>
    );
};

/** The util scales in both themes, stacked, so the inversion is visible rather than described. */
const UtilityScales: FunctionComponent = () => {
    const groups = ['--color-util-gray-', '--color-util-brand-', '--color-util-warning-'];

    return (
        <>
            {groups.map((prefix) => (
                <UtilityScale key={prefix} prefix={prefix} />
            ))}
        </>
    );
};

const UtilityScale: FunctionComponent<{ prefix: string }> = ({ prefix }) => {
    const tokens = useTokens(prefix);

    if (tokens.length === 0) {
        return null;
    }

    return (
        <div className={styles.themePair}>
            <div>
                <span className={styles.themePairLabel}>{prefix}* &mdash; light</span>
                <ScaleStrip tokens={tokens} theme="light" />
            </div>
            <div>
                <span className={styles.themePairLabel}>{prefix}* &mdash; dark</span>
                <ScaleStrip tokens={tokens} theme="dark" />
            </div>
        </div>
    );
};
