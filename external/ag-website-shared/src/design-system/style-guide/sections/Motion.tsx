import variablesSource from '@design-system/core/_variables.scss?raw';
import { useMemo, useState } from 'react';
import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Guidance, KnownIssue, Section } from '../chrome/Section';
import { Specimen } from '../chrome/Specimen';
import { parseSassVariables } from '../lib/sassSource';

const DURATIONS = [
    {
        name: '$transition-default-timing',
        use: 'Everything by default: button and input backgrounds, borders, focus rings, link colour, tab indicators.',
    },
    {
        name: '0.125s ease-in-out',
        use: 'Button :active only. The press-down is faster than the release so the control feels responsive.',
    },
    { name: '0.3s ease-in-out', use: 'Tab underline opacity.' },
    { name: '0.35s ease', use: '.collapsing height animation for expanding sections.' },
];

const ESCAPE_HATCHES = [
    {
        name: '.no-transitions',
        use: 'Suppresses every transition on the element and its whole subtree with !important. Applied while a theme switch or a layout change is in flight, so state changes do not animate.',
    },
    {
        name: '.no-overflow-anchor',
        use: 'Turns off scroll anchoring, so an expanding section does not push the page up as it grows.',
    },
];

/**
 * Motion.
 *
 * A short section because there is very little to document - one timing variable covers almost
 * everything. Saying so explicitly is useful: the absence of a duration scale is a fact about the
 * system, not an omission from the guide.
 */
export const Motion: FunctionComponent = () => {
    const [playing, setPlaying] = useState(false);
    const timing = useMemo(
        () => parseSassVariables(variablesSource).find((variable) => variable.name === 'transition-default-timing'),
        []
    );

    return (
        <Section
            id="motion"
            title="Motion"
            source={['core/_variables.scss', '_interactions.scss']}
            lede={
                <>
                    <p>
                        There is one motion token: <code>$transition-default-timing</code>, currently{' '}
                        <code>{timing?.value}</code>. Interactive elements use it for colour, border and shadow
                        transitions, which is what gives controls across the site a consistent feel.
                    </p>
                    <p>
                        There is no duration or easing scale. Anything that needs different timing states it inline, so
                        the handful of exceptions below are the entire motion vocabulary of the system.
                    </p>
                </>
            }
        >
            <Block title="Timings in use">
                <div className={styles.tableScroll}>
                    <table className={styles.tokenTable}>
                        <thead>
                            <tr>
                                <th scope="col">Timing</th>
                                <th scope="col">Where</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DURATIONS.map(({ name, use }) => (
                                <tr key={name}>
                                    <td data-column="Timing">
                                        <CopyButton value={name} inline />
                                    </td>
                                    <td data-column="Where">{use}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Block>

            <Block
                title="What the default timing feels like"
                note={
                    <p>
                        Both boxes transition background and transform. The left uses the design system timing; the
                        right uses a snappier 0.125s, which is the only other duration the system uses.
                    </p>
                }
            >
                <Specimen>
                    <button type="button" className="button-secondary" onClick={() => setPlaying((value) => !value)}>
                        {playing ? 'Reset' : 'Play'}
                    </button>
                    <div className={styles.motionTrack}>
                        <div className={styles.motionRow}>
                            <span className={styles.motionLabel}>{timing?.value}</span>
                            <span className={styles.motionBox} data-playing={playing} />
                        </div>
                        <div className={styles.motionRow}>
                            <span className={styles.motionLabel}>0.125s ease-in-out</span>
                            <span className={styles.motionBoxFast} data-playing={playing} />
                        </div>
                    </div>
                </Specimen>
            </Block>

            <Block title="Escape hatches">
                <div className={styles.tableScroll}>
                    <table className={styles.tokenTable}>
                        <thead>
                            <tr>
                                <th scope="col">Class</th>
                                <th scope="col">What it does</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ESCAPE_HATCHES.map(({ name, use }) => (
                                <tr key={name}>
                                    <td data-column="Class">
                                        <CopyButton value={name.slice(1)} label={name} inline />
                                    </td>
                                    <td data-column="What it does">{use}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Block>

            <Block
                title="View transitions"
                note={
                    <p>
                        <code>_interactions.scss</code> suppresses the default root cross-fade, so only explicitly named
                        view transitions animate on navigation. Without that suppression the root and{' '}
                        <code>&lt;main&gt;</code> fade at the same time and every navigation double-fades.
                    </p>
                }
            >
                <Specimen
                    code={`::view-transition-old(root),
::view-transition-new(root) {
    animation: none;
}`}
                >
                    <p>
                        If you add a view transition, give it a name and animate that name. Do not re-enable the root
                        animation.
                    </p>
                </Specimen>
            </Block>

            <Block title="Using motion">
                <Guidance
                    dos={[
                        <>
                            Use <code>$transition-default-timing</code> for hover, focus and active feedback, so a new
                            control matches every existing one.
                        </>,
                        <>
                            List the properties you are transitioning rather than using <code>all</code>; transitioning
                            everything makes later layout changes animate unexpectedly.
                        </>,
                        <>
                            Add a <code>@media (prefers-reduced-motion: reduce)</code> block for anything that moves,
                            scales or auto-plays.
                        </>,
                    ]}
                    donts={[
                        <>
                            Don&rsquo;t animate layout properties such as <code>height</code>, <code>width</code> or{' '}
                            <code>top</code> where <code>transform</code> would do - they force layout on every frame.
                        </>,
                        <>
                            Don&rsquo;t invent a new duration for a one-off. If the default feels wrong for a whole
                            class of interaction, the system needs a second token.
                        </>,
                    ]}
                />
            </Block>

            <KnownIssue>
                <p>
                    The design system has no global <code>prefers-reduced-motion</code> handling. Individual components
                    honour it, but nothing in <code>_interactions.scss</code> or <code>_base.scss</code> does, so every
                    new animated component has to remember on its own. A global rule that disables non-essential
                    transitions under the reduce preference would remove that requirement.
                </p>
            </KnownIssue>
        </Section>
    );
};
