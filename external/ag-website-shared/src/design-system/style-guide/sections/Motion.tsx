import variablesSource from '@design-system/core/_variables.scss?raw';
import { useMemo, useState } from 'react';
import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Guidance, Section } from '../chrome/Section';
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
                <p>
                    One token, <code>$transition-default-timing</code> (<code>{timing?.value}</code>). There is no
                    duration or easing scale, so the table below is the system&rsquo;s entire motion vocabulary.
                </p>
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

            <Block title="What the default timing feels like">
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

            <Block title="Usage">
                <Guidance
                    dos={[
                        <>Name the properties you transition.</>,
                        <>
                            Animate <code>transform</code> and <code>opacity</code>.
                        </>,
                        <>Give a page transition a name and animate that.</>,
                    ]}
                    donts={[
                        <>
                            Don&rsquo;t transition <code>all</code>. Later layout changes start animating.
                        </>,
                        <>
                            Don&rsquo;t animate <code>height</code>, <code>width</code> or <code>top</code>.
                        </>,
                        <>Don&rsquo;t re-enable the root view transition. Every navigation double-fades.</>,
                    ]}
                />
            </Block>
        </Section>
    );
};
