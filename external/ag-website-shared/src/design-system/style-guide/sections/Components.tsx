import { Alert } from '@ag-website-shared/components/alert/Alert';
import Card from '@ag-website-shared/components/card/Card';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import Pill from '@ag-website-shared/components/pill/Pill';
import { Tabs } from '@ag-website-shared/components/tabs/Tabs';
import type { CSSProperties, FunctionComponent, ReactNode } from 'react';

import styles from '../StyleGuide.module.scss';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Guidance, Section } from '../chrome/Section';
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
            title="In documentation pages"
            note={<p>Documentation pages write alerts as markdoc tags. Each tag renders one of the types above.</p>}
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
        </Block>

        <Block title="Usage">
            <Guidance
                dos={[
                    <>Keep each alert to one idea.</>,
                    <>Pick the type by what the reader should do with it, using the descriptions above.</>,
                ]}
                donts={[
                    <>Don&rsquo;t put the only copy of essential information in an alert - readers skip boxes.</>,
                    <>Don&rsquo;t stack alerts. Several in a row read as decoration rather than emphasis.</>,
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
                    The tab strip and panel styling. Use the <code>Tabs</code> component below rather than these classes
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
                    A bordered panel that can link somewhere as a whole. It is a different design from the{' '}
                    <code>.card</code> class above, and the two are not interchangeable.
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
        </Block>

        <Block
            title="Tabs component"
            note={
                <p>
                    Renders the <code>.tabs-outer</code> markup above with selection behaviour. Each child is a panel,
                    labelled by its <code>tab-label</code>.
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
        </Block>

        <Block title="Usage">
            <Guidance
                dos={[
                    <>
                        Use the <code>.card</code> class to group related content, and <code>Card</code> for a panel
                        that links somewhere as a whole.
                    </>,
                    <>
                        Pass <code>link</code> to make a <code>Card</code> clickable, and add <code>hoverLift</code>{' '}
                        only when it has one.
                    </>,
                    <>Use tabs for alternative versions of the same content, such as one example per framework.</>,
                ]}
                donts={[
                    <>Don&rsquo;t nest cards - the tints compound and the inner card loses its edge.</>,
                    <>
                        Don&rsquo;t make a card clickable with <code>onClick</code> alone. It is not reachable by
                        keyboard.
                    </>,
                    <>Don&rsquo;t use tabs for content the reader needs to compare side by side.</>,
                ]}
            />
        </Block>
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
                    Write <code>text</code> in natural case. The pill capitalises it.
                </p>
            </Specimen>
        </Block>

        <Block title="Usage">
            <Guidance
                dos={[
                    <>Pick the colour by its meaning in the table above, so a colour means the same on every page.</>,
                    <>Make the text say the status on its own. Colour only reinforces it.</>,
                ]}
                donts={[
                    <>Don&rsquo;t use a pill as a button or link. It has no hover or focus state.</>,
                    <>Don&rsquo;t pick a colour because it looks right on the page.</>,
                ]}
            />
        </Block>
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
