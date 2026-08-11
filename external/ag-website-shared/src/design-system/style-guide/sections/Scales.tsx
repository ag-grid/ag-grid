import variablesSource from '@design-system/core/_variables.scss?raw';
import { useMemo } from 'react';
import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { useStyleGuide, useTokens } from '../StyleGuideContext';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Guidance, KnownIssue, Section } from '../chrome/Section';
import { Specimen, Variant } from '../chrome/Specimen';
import { parseSassVariables, pxVariables } from '../lib/sassSource';

/** Typical use for each spacing step, keyed by the step number in `$spacing-size-N`. */
const SPACING_USE: Record<string, string> = {
    '1': 'Hairline gaps: icon to label, focus ring width.',
    '2': 'Tight gaps: list items, heading to following text, inline chips.',
    '3': 'Form field stacks.',
    '4': 'Default padding inside a component; gap between list groups.',
    '5': 'Paragraph rhythm - the gap between blocks of prose.',
    '6': 'Horizontal page margins on narrow viewports.',
    '8': 'Gap between related components; default icon size.',
    '10': 'Padding inside a large card.',
    '12': 'Gap between sub-sections.',
    '16': 'Gap between major blocks within a section.',
    '20': 'Section padding on small viewports.',
    '24': 'Section padding.',
    '32': 'Large section padding; hero spacing.',
    '40': 'Reserved for hero and landing layouts.',
    '48': 'Reserved for hero and landing layouts.',
    '56': 'Reserved for hero and landing layouts.',
    '64': 'Reserved for hero and landing layouts.',
};

const RADIUS_USE: Record<string, string> = {
    none: 'Squaring off a corner that would otherwise inherit a radius.',
    xxs: 'Hairline details: tag dots, progress bars.',
    xs: 'Small chips and badges.',
    sm: 'The default. Buttons, inputs, code, kbd, tabs.',
    md: 'Cards, pre blocks, panels.',
    lg: 'Larger panels.',
    xl: 'Modals and popovers.',
    '2xl': 'Feature cards.',
    '3xl': 'Hero surfaces.',
    '4xl': 'Hero surfaces.',
    full: 'Circles: radio inputs, avatars, switch tracks.',
};

const SHADOW_USE: Record<string, string> = {
    'shadow-xs': 'Resting state of buttons and inputs. Barely visible by design.',
    'shadow-sm': 'Cards at rest.',
    'shadow-md': 'Hovered cards, dropdown triggers.',
    'shadow-lg': 'Popovers and menus.',
    'shadow-xl': 'Modals.',
    'shadow-2xl': 'Full-screen overlays.',
};

/**
 * Spacing scale.
 *
 * Read out of `core/_variables.scss` rather than restated here - the previous guide kept its own
 * copy of the seventeen values, which is exactly the kind of duplication that goes stale quietly.
 */
export const Spacing: FunctionComponent = () => {
    const { filter } = useStyleGuide();
    const steps = useMemo(() => pxVariables(parseSassVariables(variablesSource)), []);
    const needle = filter.trim().toLowerCase();
    const visible = steps.filter((step) => needle === '' || step.name.toLowerCase().includes(needle));

    return (
        <Section
            id="spacing"
            title="Spacing"
            source="core/_variables.scss"
            lede={
                <>
                    <p>
                        A 4px-based scale, available as Sass variables only. There is no <code>--spacing-*</code> custom
                        property, so spacing cannot be re-pointed per theme or overridden per subtree - it is a fixed
                        scale by design.
                    </p>
                    <p>
                        The step number is the multiplier: <code>$spacing-size-4</code> is 4 &times; 4px = 16px. Steps
                        run 1-6 in single increments and then jump, so the small end is fine-grained and the large end
                        is coarse.
                    </p>
                </>
            }
        >
            <Block title="Scale">
                {visible.length === 0 ? (
                    <p className={styles.emptyState}>No spacing steps match the current filter.</p>
                ) : (
                    <div className={styles.tableScroll}>
                        <table className={styles.tokenTable}>
                            <thead>
                                <tr>
                                    <th scope="col">Variable</th>
                                    <th scope="col">px</th>
                                    <th scope="col">rem</th>
                                    <th scope="col">Size</th>
                                    <th scope="col">Typically</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((step) => {
                                    const number = step.name.replace('spacing-size-', '');
                                    return (
                                        <tr key={step.name}>
                                            <td data-column="Variable">
                                                <CopyButton value={`$${step.name}`} inline />
                                            </td>
                                            <td data-column="px">{step.px}</td>
                                            <td data-column="rem">{(step.px! / 16).toString()}</td>
                                            <td data-column="Size">
                                                <span className={styles.spacingBar} style={{ width: step.value }} />
                                            </td>
                                            <td data-column="Typically">{SPACING_USE[number]}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Block>

            <Block title="Using the scale">
                <Guidance
                    dos={[
                        <>
                            Use a step for every <code>gap</code>, <code>margin</code> and <code>padding</code>.
                        </>,
                        <>
                            Prefer <code>gap</code> on a flex or grid container over margins on children - it collapses
                            correctly when items wrap.
                        </>,
                        <>
                            Use <code>var(--layout-gap)</code> rather than a spacing step for gutters between layout
                            columns, so column widths and gutters stay in agreement.
                        </>,
                    ]}
                    donts={[
                        <>
                            Don&rsquo;t use raw px. A value between two steps means one of the two steps was the right
                            answer.
                        </>,
                        <>
                            Don&rsquo;t add margins to prose elements - <code>_typography.scss</code> already spaces
                            them, and adding more double-spaces the page.
                        </>,
                        <>
                            Don&rsquo;t use <code>em</code> for structural spacing; it compounds with whatever font size
                            the component happens to inherit.
                        </>,
                    ]}
                />
            </Block>
        </Section>
    );
};

/** Border radii. */
export const Radii: FunctionComponent = () => {
    const tokens = useTokens('--radius-');

    return (
        <Section
            id="radii"
            title="Border radii"
            source="_root.scss"
            lede={
                <p>
                    Eleven steps from square to circle. <code>--radius-sm</code> is the system default and covers most
                    interactive controls; anything larger is a deliberate choice for a surface rather than a control.
                </p>
            }
        >
            <Block title="Scale">
                {tokens.length === 0 ? (
                    <p className={styles.emptyState}>No radii match the current filter.</p>
                ) : (
                    <div className={styles.radiiGrid}>
                        {tokens.map((token) => (
                            <div key={token.name} className={styles.radiiItem}>
                                <div
                                    className={styles.radiiSample}
                                    style={{ borderRadius: `var(${token.name})` }}
                                    aria-hidden="true"
                                />
                                <CopyButton value={`var(${token.name})`} label={token.label} inline />
                                <span className={styles.radiiValue}>{token.substituted.light}</span>
                                <span className={styles.radiiUse}>{RADIUS_USE[token.label]}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Block>

            <KnownIssue>
                <p>
                    <code>--radius-full</code> is <code>100%</code>, not a large px value. On a non-square element that
                    produces an ellipse rather than a pill, so it only behaves as &ldquo;fully rounded&rdquo; on
                    equal-sided elements such as radio inputs. For a pill, use a large step or <code>9999px</code>{' '}
                    directly.
                </p>
            </KnownIssue>
        </Section>
    );
};

/** Elevation. */
export const Shadows: FunctionComponent = () => {
    const tokens = useTokens('--shadow-');

    return (
        <Section
            id="shadows"
            title="Shadows"
            source="_root.scss"
            lede={
                <>
                    <p>
                        Six elevation steps, all built with <code>color-mix()</code> against{' '}
                        <code>--color-gray-950</code> at low alpha rather than a fixed black, so they tint with the
                        neutral scale.
                    </p>
                    <p>
                        Shadows are translucent and do not change between themes. On the dark background they are
                        correspondingly much weaker - use a border as well as, or instead of, a shadow when an edge
                        needs to read in dark mode.
                    </p>
                </>
            }
        >
            <Block title="Steps" note={<p>Shown on both the primary and secondary background.</p>}>
                {tokens.length === 0 ? (
                    <p className={styles.emptyState}>No shadows match the current filter.</p>
                ) : (
                    <>
                        <Specimen label="On --color-bg-primary" row>
                            {tokens.map((token) => (
                                <Variant key={token.name} name={token.label}>
                                    <div className={styles.shadowSample} style={{ boxShadow: `var(${token.name})` }} />
                                </Variant>
                            ))}
                        </Specimen>
                        <Specimen label="On --color-bg-secondary" row onSecondary>
                            {tokens.map((token) => (
                                <Variant key={token.name} name={token.label}>
                                    <div className={styles.shadowSample} style={{ boxShadow: `var(${token.name})` }} />
                                </Variant>
                            ))}
                        </Specimen>
                        <div className={styles.tableScroll}>
                            <table className={styles.tokenTable}>
                                <thead>
                                    <tr>
                                        <th scope="col">Token</th>
                                        <th scope="col">Value</th>
                                        <th scope="col">Typically</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tokens.map((token) => (
                                        <tr key={token.name}>
                                            <td data-column="Token">
                                                <CopyButton value={`var(${token.name})`} label={token.name} inline />
                                            </td>
                                            <td data-column="Value">
                                                <code className={styles.shadowValue}>{token.raw.light}</code>
                                            </td>
                                            <td data-column="Typically">{SHADOW_USE[token.label]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </Block>

            <Block title="Using elevation">
                <Guidance
                    dos={[
                        <>Step up one level on hover, not two - elevation changes should be felt rather than seen.</>,
                        <>
                            Pair a shadow with <code>--color-border-secondary</code> for anything that must read as a
                            distinct surface in dark mode.
                        </>,
                    ]}
                    donts={[
                        <>
                            Don&rsquo;t write a custom box-shadow. If none of the six steps fits, the design is asking
                            for a border.
                        </>,
                        <>
                            Don&rsquo;t rely on a shadow alone to separate a floating panel from the page in dark mode;
                            it will be close to invisible.
                        </>,
                    ]}
                />
            </Block>
        </Section>
    );
};
