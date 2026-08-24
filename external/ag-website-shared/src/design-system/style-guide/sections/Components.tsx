import { Alert } from '@ag-website-shared/components/alert/Alert';
import Card from '@ag-website-shared/components/card/Card';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import Pill from '@ag-website-shared/components/pill/Pill';
import { Tabs } from '@ag-website-shared/components/tabs/Tabs';
import type { CSSProperties, FunctionComponent, ReactNode } from 'react';

import styles from '../StyleGuide.module.scss';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Gotcha, KnownIssue, Section } from '../chrome/Section';
import { Specimen, Variant } from '../chrome/Specimen';

/**
 * A panel for the `Tabs` specimen.
 *
 * `Tabs` reads `tab-label` off its children's props, which TypeScript will not accept on a plain
 * `div`, so the demo needs a component that declares it.
 */
const TabPanel: FunctionComponent<{ 'tab-label': string; children: ReactNode }> = ({ children }) => <>{children}</>;

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

/**
 * The wrappers, and the markdoc tag each one backs.
 *
 * Kept as data because the mapping is the information: nothing in `Note.tsx` says it is what
 * `{% note %}` renders, and nothing in `note.ts` says it produces an `info` alert.
 */
const ALERT_WRAPPERS = [
    { tag: 'note', wrapper: 'Note', type: 'info' },
    { tag: 'warning', wrapper: 'Warning', type: 'warning' },
    { tag: 'idea', wrapper: 'Idea', type: 'idea' },
    { tag: undefined, wrapper: 'Success', type: 'success' },
] as const;

/** Alerts: the four semantic callouts plus the plain variant. */
export const Alerts: FunctionComponent = () => (
    <Section
        id="alerts"
        title="Alerts"
        source="components/alert/Alert.tsx"
        lede={
            <p>
                Callouts that interrupt the reading flow. The <code>type</code> sets both colour and icon, so the two
                cannot disagree.
            </p>
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

        <Block
            title="Named wrappers and markdoc tags"
            note={
                <p>
                    Three of the five types have a thin named wrapper that exists so markdoc can render them as a tag -
                    which is how nearly every alert on the documentation site is actually authored. They take{' '}
                    <code>children</code> and nothing else.
                </p>
            }
        >
            <div className={styles.tableScroll}>
                <table className={styles.tokenTable}>
                    <thead>
                        <tr>
                            <th scope="col">Markdoc tag</th>
                            <th scope="col">Wrapper</th>
                            <th scope="col">Equivalent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ALERT_WRAPPERS.map(({ tag, wrapper, type }) => (
                            <tr key={wrapper}>
                                <th scope="row">
                                    {tag ? <CopyButton value={`{% ${tag} %}`} label={tag} inline /> : <em>none</em>}
                                </th>
                                <td data-column="Wrapper">
                                    <code>{wrapper}</code>
                                </td>
                                <td data-column="Equivalent">
                                    <code>{`<Alert type="${type}">`}</code>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Specimen
                label="The three spellings are the same component"
                code={`{% note %}
Supporting detail the reader can act on but does not have to.
{% /note %}

// identical rendering
<Note>Supporting detail…</Note>
<Alert type="info">Supporting detail…</Alert>`}
            />
            <p>
                All four wrappers are <strong>default</strong> exports, unlike <code>Alert</code> itself, which is
                named. <code>Success</code> has no markdoc tag registered, so it is reachable only from React, and the{' '}
                <code>default</code> type has neither a wrapper nor a tag.
            </p>
        </Block>

        <Gotcha>
            Readers skip boxes, so an alert must not hold the only copy of something essential. One idea each, and
            don&rsquo;t stack them - three in a row reads as decoration rather than emphasis.
        </Gotcha>
    </Section>
);

/** Containers: the global card and tabs patterns from `components/_containers.scss`. */
export const Containers: FunctionComponent = () => (
    <Section
        id="containers"
        title="Cards and tabs"
        source={['components/_containers.scss', 'components/card/Card.tsx']}
        lede={
            <p>
                <code>.card</code> is a tinted panel with an optional header; <code>.tabs-outer</code> is a bordered
                panel with a tab strip. Both are global classes.
            </p>
        }
    >
        <Block
            title="Card"
            note={
                <p>
                    Set <code>--card-color</code> to re-tint the whole card - the border and both surface tints derive
                    from it.
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

        <Block
            title="Card component"
            note={
                <p>
                    The React <code>Card</code>, which is the other card - unrelated to the global <code>.card</code>{' '}
                    class above and styled entirely differently. Its job is to be a bordered, optionally clickable
                    panel; it renders an <code>&lt;a&gt;</code> when given a <code>link</code> and an{' '}
                    <code>&lt;article&gt;</code> otherwise.
                </p>
            }
        >
            <Specimen
                row
                code={`<Card>Static panel</Card>

<Card link="/documentation" hoverLift>
    Whole-card link - renders an <a>, so it is
    keyboard operable and shows a URL on hover.
</Card>`}
            >
                <Variant name="Static">
                    <Card className={styles.cardDemo}>
                        <p>A plain panel. Renders an article.</p>
                    </Card>
                </Variant>
                <Variant name="link + hoverLift">
                    <Card link="#containers" hoverLift className={styles.cardDemo}>
                        <p>A whole-card link, which lifts on hover.</p>
                    </Card>
                </Variant>
            </Specimen>
            <p>
                <code>hoverLift</code> adds the raise-on-hover affordance. Use it only together with <code>link</code>:
                on a static card it promises an interaction that does not exist. <code>onClick</code> is also accepted,
                but it lands on the bare <code>&lt;article&gt;</code> - see the gotcha below.
            </p>
        </Block>

        <Block
            title="Tabs component"
            note={
                <p>
                    The React <code>Tabs</code>, which renders the <code>.tabs-outer</code> markup above and adds the
                    selection behaviour. Tab labels come from a <code>tab-label</code> prop on each child - kebab-case
                    because the same component is driven from HTML in markdoc - and the children are the panels.
                </p>
            }
        >
            <Specimen
                label="Uncontrolled: the first child is selected"
                code={`<Tabs>
    <div tab-label="JavaScript">…</div>
    <div tab-label="React">…</div>
</Tabs>

{/* controlled, when something outside the strip has to change tabs */}
<Tabs selectedTab={selected} onTabChange={setSelected}>…</Tabs>

{/* markdoc */}
{% tabs %}
{% tabItem label="JavaScript" %}…{% /tabItem %}
{% /tabs %}`}
            >
                <Tabs>
                    {['JavaScript', 'React', 'Angular'].map((framework) => (
                        <TabPanel key={framework} tab-label={framework}>
                            <p>Panel content for {framework}.</p>
                        </TabPanel>
                    ))}
                </Tabs>
            </Specimen>
            <p>
                A child carrying <code>tabs-links</code> instead of <code>tab-label</code> is treated as a header
                accessory rather than a panel, and is rendered to the right of the tab strip - that is how the docs put
                an &ldquo;open in&rdquo; link beside a set of framework tabs.
            </p>
        </Block>

        <Gotcha>
            There are <strong>two different cards</strong>: the global <code>.card</code> class here, and a separate{' '}
            <code>Card</code> React component with its own module styles. They look different and are not
            interchangeable. Don&rsquo;t nest either - the tint mixing compounds and the inner card loses its
            distinction. A clickable card needs a real interactive element; an <code>onClick</code> on a bare{' '}
            <code>&lt;article&gt;</code> is not keyboard operable.
        </Gotcha>

        <KnownIssue>
            <p>
                <code>Card.module.scss</code> sets <code>color: var(--color-bg-secondary)</code> - a background token
                used as the text colour, which in light mode is near-white text on a white card. It also writes{' '}
                <code>transition: all $transition-default-timing ease-in-out</code>, and because that variable already
                ends in <code>ease-in-out</code> the declaration expands to two timing functions and is invalid, so the
                transition does not apply at all.
            </p>
            <p>
                <strong>
                    The <code>Tabs</code> component&rsquo;s ARIA wiring is incomplete, and one part of it is actively
                    harmful.
                </strong>{' '}
                The selected tab is rendered <code>disabled</code>, which removes the current tab from the tab order
                entirely - so a keyboard user who tabs into the strip cannot land on the tab they are already on, and
                arrow-key navigation between tabs (which the <code>tablist</code> role promises) is not implemented at
                all. The buttons also carry no <code>aria-selected</code>, so the selected state is conveyed only by a
                CSS class and the <code>disabled</code> attribute.
            </p>
            <p>
                Relatedly, the panel sets <code>aria-labelledby={'{`${selected} tab`}'}</code> - a string built from the
                label text, not an element id. <code>TabNavItem</code> accepts a <code>tabId</code> prop that would
                provide the real id, but <code>Tabs</code> never passes it, so the reference resolves to nothing and the
                panel is unlabelled. There is no <code>aria-controls</code> in the other direction either.
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
        lede={<p>Small status labels, used for release status, licence tier and feature availability.</p>}
    >
        <Block
            title="Colours and the dot"
            note={
                <p>
                    Use the dot when the pill marks a live state a reader scans for; leave it off when the pill is just
                    a label, where the dot adds a mark without adding meaning.
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

        <Gotcha>
            A pill has no interactive styling or focus state, so it cannot double as a button. Colour never carries the
            meaning on its own - the text has to say it, which is why there is no icon-only variant.
        </Gotcha>

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
