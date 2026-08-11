import { Alert } from '@ag-website-shared/components/alert/Alert';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import Pill from '@ag-website-shared/components/pill/Pill';
import type { CSSProperties, FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Guidance, KnownIssue, Section } from '../chrome/Section';
import { Specimen, Variant } from '../chrome/Specimen';

const ALERT_TYPES = [
    { type: 'info', title: 'Note', use: 'Supporting detail the reader can act on but does not have to.' },
    { type: 'idea', title: 'Tip', use: 'A better way of doing something the reader already knows how to do.' },
    {
        type: 'warning',
        title: 'Warning',
        use: 'A consequence the reader will not expect. Breaking changes, data loss, gotchas.',
    },
    {
        type: 'success',
        title: 'Success',
        use: 'Confirmation that something worked, or that a limitation has been lifted.',
    },
    { type: 'default', title: 'Plain', use: 'A callout with no icon, where the type would add nothing.' },
] as const;

/** Alerts: the four semantic callouts plus the plain variant. */
export const Alerts: FunctionComponent = () => (
    <Section
        id="alerts"
        title="Alerts"
        source="components/alert/Alert.tsx"
        lede={
            <>
                <p>
                    Callouts for information that should interrupt the reading flow. The type sets both the colour and
                    the icon, so the two never disagree.
                </p>
                <p>
                    Alerts are for content that would be missed inline. Reaching for one because a paragraph feels
                    unimportant is a sign the paragraph should be cut instead.
                </p>
            </>
        }
    >
        <Block title="Types">
            {ALERT_TYPES.map(({ type, title, use }) => (
                <Specimen key={type} label={<code>{`<Alert type="${type}">`}</code>}>
                    <Alert type={type}>
                        <p>
                            <b>{title}</b>: {use}
                        </p>
                    </Alert>
                </Specimen>
            ))}
        </Block>

        <Block title="Using alerts">
            <Guidance
                dos={[
                    <>
                        Lead with what the reader should do or know. The first few words carry the whole callout if it
                        is skimmed.
                    </>,
                    <>Keep an alert to one idea. Two warnings in one box means neither is read.</>,
                    <>
                        Use <code>warning</code> sparingly. Its value comes from being rare on the page.
                    </>,
                ]}
                donts={[
                    <>
                        Don&rsquo;t stack alerts. Three in a row is a wall of colour that reads as decoration rather
                        than emphasis.
                    </>,
                    <>Don&rsquo;t put the only copy of essential information in an alert - readers skip boxes.</>,
                    <>
                        Don&rsquo;t use <code>success</code> for general positive framing; it means something completed
                        or is now supported.
                    </>,
                ]}
            />
        </Block>
    </Section>
);

/** Containers: the global card and tabs patterns from `components/_containers.scss`. */
export const Containers: FunctionComponent = () => (
    <Section
        id="containers"
        title="Cards and tabs"
        source={['components/_containers.scss', 'components/card/Card.tsx']}
        lede={
            <>
                <p>
                    Two container patterns are styled globally. <code>.card</code> is a tinted panel with an optional
                    header, driven by a single <code>--card-color</code> that both the border and the two surface tints
                    derive from. <code>.tabs-outer</code> is a bordered panel with a tab strip.
                </p>
                <p>
                    Note that there are <strong>two different cards</strong>: the global <code>.card</code> class
                    described here, and a separate <code>Card</code> React component with its own module styles. They
                    look different and are not interchangeable.
                </p>
            </>
        }
    >
        <Block
            title="Card"
            note={
                <p>
                    Set <code>--card-color</code> to re-tint the whole card. <code>--header-tint</code> and{' '}
                    <code>--content-tint</code> control how much of the page background is mixed into each region, so a
                    lower percentage means a stronger tint.
                </p>
            }
        >
            <Specimen
                row
                code={`<div class="card">
    <header>Community</header>
    <div class="content">Free and open source.</div>
</div>

<!-- Re-tinted -->
<div class="card" style="--card-color: var(--color-brand-300)">`}
            >
                <Variant name="Default">
                    <div className={`card ${styles.cardDemo}`}>
                        <header>Community</header>
                        <div className="content">
                            <p>Free and open source, MIT licensed.</p>
                        </div>
                    </div>
                </Variant>
                <Variant name="Brand tinted">
                    <div
                        className={`card ${styles.cardDemo}`}
                        style={{ '--card-color': 'var(--color-brand-300)' } as CSSProperties}
                    >
                        <header>Enterprise</header>
                        <div className="content">
                            <p>Commercial licence with support.</p>
                        </div>
                    </div>
                </Variant>
                <Variant name="Warning tinted">
                    <div
                        className={`card ${styles.cardDemo}`}
                        style={{ '--card-color': 'var(--color-warning-300)' } as CSSProperties}
                    >
                        <header>Deprecated</header>
                        <div className="content">
                            <p>Removed in the next major version.</p>
                        </div>
                    </div>
                </Variant>
            </Specimen>
        </Block>

        <Block
            title="Tabs"
            note={
                <p>
                    Structural styling only - the active state is a class, so tab behaviour and keyboard handling are
                    the caller&rsquo;s responsibility. Use the <code>Tabs</code> component rather than these classes
                    unless you need something it does not do.
                </p>
            }
        >
            <Specimen
                code={`<div class="tabs-outer">
    <header>
        <ul class="tabs-nav-list">
            <li class="tabs-nav-item">
                <span class="tabs-nav-link active">JavaScript</span>
            </li>
        </ul>
    </header>
    <div class="tabs-content">…</div>
</div>`}
            >
                <div className="tabs-outer">
                    <header>
                        <ul className="tabs-nav-list">
                            {['JavaScript', 'React', 'Angular', 'Vue'].map((framework, index) => (
                                <li key={framework} className="tabs-nav-item">
                                    <span className={`tabs-nav-link ${index === 0 ? 'active' : ''}`}>{framework}</span>
                                </li>
                            ))}
                        </ul>
                    </header>
                    <div className="tabs-content">
                        <p>Panel content for the active tab.</p>
                    </div>
                </div>
            </Specimen>
        </Block>

        <Block title="Using containers">
            <Guidance
                dos={[
                    <>
                        Drive a card&rsquo;s appearance through <code>--card-color</code> rather than overriding its
                        background and border separately - the tints stay consistent that way.
                    </>,
                    <>
                        Use a real interactive element for a clickable card. The <code>Card</code> component renders an{' '}
                        <code>&lt;a&gt;</code> when given a <code>link</code>, and an <code>&lt;article&gt;</code>{' '}
                        otherwise.
                    </>,
                    <>
                        Mark up tabs with the <code>tab</code> / <code>tablist</code> / <code>tabpanel</code> roles and
                        arrow-key navigation if you are not using the shared component.
                    </>,
                ]}
                donts={[
                    <>
                        Don&rsquo;t put an <code>onClick</code> on a bare <code>&lt;article&gt;</code> card - it is not
                        focusable or keyboard operable.
                    </>,
                    <>
                        Don&rsquo;t nest cards. The tint mixing compounds and the nested card loses its distinction from
                        its parent.
                    </>,
                ]}
            />
        </Block>

        <KnownIssue>
            <p>
                <code>Card.module.scss</code> sets <code>color: var(--color-bg-secondary)</code> - a background token
                used as the text colour, which in light mode is near-white text on a white card. It also writes{' '}
                <code>transition: all $transition-default-timing ease-in-out</code>, and because that variable already
                ends in <code>ease-in-out</code> the declaration expands to two timing functions and is invalid, so the
                transition does not apply at all.
            </p>
        </KnownIssue>
    </Section>
);

/**
 * The four variants, with what each is for.
 *
 * Recording the meaning matters more than the swatch here: four interchangeable colours invite
 * picking one that looks right, and then the same colour means different things on two pages.
 */
const PILL_COLOURS = [
    {
        color: 'blue',
        means: 'Neutral or in-progress state. The default, and the fallback when a status is unrecognised.',
    },
    { color: 'green', means: 'Done, available, shipped.' },
    { color: 'yellow', means: 'Planned, pending, or needs attention but not broken.' },
    { color: 'red', means: 'Failed, removed, or blocked.' },
] as const;

/** Pills. */
export const Pills: FunctionComponent = () => (
    <Section
        id="pills"
        title="Pills"
        source="components/pill/Pill.tsx"
        lede={
            <p>
                Small status labels. Four colours, each with an optional leading dot. Used for release status, licence
                tier and feature availability.
            </p>
        }
    >
        <Block
            title="Colours and the dot"
            note={
                <p>
                    Four colours, each available with or without a leading status dot. Use the dot when the pill marks a
                    live state that a reader scans for - a build status, a roadmap stage. Leave it off when the pill is
                    just a label, such as a licence tier, where the dot adds a mark without adding meaning.
                </p>
            }
        >
            <div className={styles.tableScroll}>
                <table className={styles.tokenTable}>
                    <thead>
                        <tr>
                            <th scope="col">Colour</th>
                            <th scope="col">No dot</th>
                            <th scope="col">With dot</th>
                            <th scope="col">Means</th>
                        </tr>
                    </thead>
                    <tbody>
                        {PILL_COLOURS.map(({ color, means }) => (
                            <tr key={color}>
                                <th scope="row">
                                    <CopyButton value={`color="${color}"`} label={color} inline />
                                </th>
                                <td data-column="No dot">
                                    <Pill text={color} color={color} />
                                </td>
                                <td data-column="With dot">
                                    <Pill text={color} color={color} dot />
                                </td>
                                <td data-column="Means">{means}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Specimen
                label="Props"
                code={`<Pill text="Shipped" color="green" dot />
<Pill text="Enterprise" color="blue" />`}
            >
                <p>
                    <code>text</code> and <code>color</code> are required; <code>dot</code> and <code>className</code>{' '}
                    are optional. <code>text</code> is rendered <code>text-transform: capitalize</code>, so pass it in
                    natural case rather than pre-capitalising.
                </p>
            </Specimen>
        </Block>

        <Block title="Using pills">
            <Guidance
                dos={[
                    <>Keep the label to one or two words. A pill is a label, not a sentence.</>,
                    <>Use the same colour for the same meaning across the site - blue for tier, green for available.</>,
                ]}
                donts={[
                    <>Don&rsquo;t use a pill as a button. It has no interactive styling or focus state.</>,
                    <>
                        Don&rsquo;t rely on colour alone to carry the meaning; the text has to say it too, which is why
                        there is no icon-only variant.
                    </>,
                ]}
            />
        </Block>

        <KnownIssue>
            <p>
                <strong>The red variant still has no real palette behind it.</strong> <code>Pill.module.scss</code>{' '}
                referenced <code>--color-error</code> and <code>--color-red-100/300/600/950</code> - five tokens that
                are not declared anywhere - so the variant rendered with no background, border colour or text colour at
                all. It is now mixed from <code>--color-negative</code>, the one red token that does exist, which makes
                it render correctly but is a stopgap: the design system has no red scale, and adding one is a design
                decision rather than an implementation one. Until it has one, red is the only variant not built from a
                scale.
            </p>
            <p>
                Two related defects were fixed alongside it. The <code>dot</code> prop was inert - the dot was declared
                unconditionally on <code>.pill</code> and no <code>.dot</code> class existed, so <code>styles.dot</code>{' '}
                was <code>undefined</code> and passing <code>dot</code> added a class literally named{' '}
                <code>undefined</code>. And <code>font-weight: var(--text-fw-medium)</code> referenced a sixth
                non-existent token, immediately before <code>font-weight</code> was set again to a real one.
            </p>
            <p>
                <strong>The green and yellow variants fail contrast in the light theme.</strong> Pill text is 12px, so
                it needs 4.5:1. Measured against the tint each pill actually sits on: <code>green 2.92:1</code> and{' '}
                <code>yellow 2.20:1</code>, against <code>blue 8.65:1</code> and <code>red 6.17:1</code>. Green uses{' '}
                <code>--color-success</code> and yellow <code>--color-warning-500</code> as text colours, and both are
                tuned as fill colours rather than type. All four pass in the dark theme, where the text colours are
                lightened. Darkening the two light values the way red now is would fix it, but it changes the appearance
                of shipped roadmap status pills, so it wants a design call rather than a drive-by change.
            </p>
        </KnownIssue>
    </Section>
);

/** Small demo used by the accessibility section to show focus order on real controls. */
export const FocusDemo: FunctionComponent = () => (
    <>
        <a href="#accessibility">A link</a>
        <button type="button">A button</button>
        <input type="text" aria-label="A text input" defaultValue="A text input" />
        <input type="checkbox" aria-label="A checkbox" />
        <select aria-label="A select">
            <option>A select</option>
        </select>
        <button type="button" className="button-secondary" aria-label="Icon only">
            <Icon name="search" />
        </button>
    </>
);
