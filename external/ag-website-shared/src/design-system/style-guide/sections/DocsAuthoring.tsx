import { NumberHeading } from '@ag-website-shared/components/number-heading/NumberHeading';
import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Gotcha, Guidance, KnownIssue, Section } from '../chrome/Section';
import { Specimen } from '../chrome/Specimen';

/**
 * Every markdoc tag that ships from `ag-website-shared`, with where its rendering is documented.
 *
 * The point of the table is the last column: the tags and the components they render are named
 * differently and live in different trees, so "which tag gives me an alert" is otherwise a two-step
 * grep. `registered` records whether this repo's `markdoc.config.ts` wires it up - a shared tag is
 * not automatically available to a page.
 */
const SHARED_TAGS = [
    { tag: 'note', renders: 'Alert type="info"', registered: true, seeAlso: 'Alerts' },
    { tag: 'warning', renders: 'Alert type="warning"', registered: true, seeAlso: 'Alerts' },
    { tag: 'idea', renders: 'Alert type="idea"', registered: true, seeAlso: 'Alerts' },
    { tag: 'kbd', renders: '<kbd>, with a Mac label swap', registered: true, seeAlso: 'Text elements' },
    { tag: 'kbdShortcut', renders: 'A run of <kbd> joined by "+"', registered: true, seeAlso: 'Text elements' },
    { tag: 'enterpriseIcon', renders: 'EnterpriseIcon', registered: true, seeAlso: 'Icons' },
    { tag: 'tabs / tabItem', renders: 'Tabs', registered: true, seeAlso: 'Cards and tabs' },
    { tag: 'expandingSection', renders: 'ExpandingSection.astro', registered: true, seeAlso: 'Disclosure' },
    { tag: 'image', renders: 'Image.astro', registered: true, seeAlso: 'Images and video' },
    { tag: 'imageCaption', renders: 'ImageCaption.astro', registered: true, seeAlso: 'Images and video' },
    { tag: 'video', renders: 'Video.astro', registered: true, seeAlso: 'Images and video' },
    { tag: 'videoSection', renders: 'VideoSection.astro', registered: true, seeAlso: 'Images and video' },
    { tag: 'touchImage', renders: 'TouchImage.astro', registered: false, seeAlso: 'Images and video' },
    { tag: 'numberHeading', renders: 'NumberHeading', registered: true, seeAlso: 'Below' },
    { tag: 'majorTable', renders: 'MajorTable.astro', registered: true, seeAlso: 'Below' },
    { tag: 'openInCTA', renders: 'OpenInCTA', registered: true, seeAlso: 'Buttons' },
    { tag: 'embedSnippet', renders: 'EmbedSnippet.astro', registered: true, seeAlso: 'Code' },
    { tag: 'br', renders: '<br>', registered: true, seeAlso: '-' },
    { tag: 'gettingStarted', renders: 'GettingStarted', registered: true, seeAlso: '-' },
    { tag: 'featuresSection', renders: 'DocsFeaturesSection', registered: true, seeAlso: '-' },
    { tag: 'changelogSection', renders: 'ChangelogSection.astro', registered: true, seeAlso: '-' },
    {
        tag: 'documentationArchiveSection',
        renders: 'DocumentationArchiveSection.astro',
        registered: true,
        seeAlso: '-',
    },
    { tag: 'trialLicenceForm', renders: 'TrialLicenceForm.astro', registered: true, seeAlso: 'Form controls' },
] as const;

/**
 * Docs authoring: the markdoc layer, which is how most of this design system is actually reached.
 *
 * Worth its own section because the tag names are the API for anyone writing documentation, and
 * they are not discoverable from the components - `{% idea %}` renders `Alert type="idea"`, and
 * nothing in either file says so.
 */
export const DocsAuthoring: FunctionComponent = () => (
    <Section
        id="docs-authoring"
        title="Docs authoring tags"
        source={['../markdoc/tags/', '../markdoc/nodes/heading.ts']}
        lede={
            <p>
                Documentation pages are markdoc, so a page author reaches these components through a tag rather than an
                import. The tags live in <code>src/markdoc/tags/</code> and each site opts into the ones it wants in its
                own <code>markdoc.config.ts</code>.
            </p>
        }
    >
        <Block
            title="Tag inventory"
            note={
                <p>
                    Every tag <code>ag-website-shared</code> exports. <strong>Registered</strong> is whether this
                    repo&rsquo;s <code>markdoc.config.ts</code> wires it up - the grid docs also register a dozen
                    grid-only tags (<code>gridExampleRunner</code>, <code>apiDocumentation</code>,{' '}
                    <code>matrixTable</code>, <code>flex</code>, <code>gif</code> and others) that are not shared and so
                    are out of scope here.
                </p>
            }
        >
            <div className={styles.tableScroll}>
                <table className={styles.tokenTable}>
                    <thead>
                        <tr>
                            <th scope="col">Tag</th>
                            <th scope="col">Renders</th>
                            <th scope="col">Registered</th>
                            <th scope="col">Documented in</th>
                        </tr>
                    </thead>
                    <tbody>
                        {SHARED_TAGS.map(({ tag, renders, registered, seeAlso }) => (
                            <tr key={tag}>
                                <th scope="row">
                                    <CopyButton value={`{% ${tag.split(' ')[0]} %}`} label={tag} inline />
                                </th>
                                <td data-column="Renders">
                                    <code>{renders}</code>
                                </td>
                                <td data-column="Registered">
                                    <span className={registered ? styles.verdictPass : styles.verdictFail}>
                                        {registered ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td data-column="Documented in">{seeAlso}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Block>

        <Block
            title="Number heading"
            note={
                <p>
                    A numbered step with a rule connecting it to the next one - used for sequential instructions where
                    the order is the content. It is a real heading underneath, so it gets an id, a copy link, and an
                    entry in the page&rsquo;s side navigation.
                </p>
            }
        >
            <Specimen
                code={`{% numberHeading number="1" title="Install the package" level="h3" %}
Content for the step.
{% /numberHeading %}`}
            >
                <div className={styles.numberHeadingDemo}>
                    <NumberHeading number="1" title="Install the package" level="h3">
                        <p>
                            The heading id is slugged from the title, so the anchor is stable as long as the title is.
                        </p>
                    </NumberHeading>
                    <NumberHeading number="2" title="Register a licence key" level="h3">
                        <p>
                            <code>level</code> defaults to <code>h2</code> and controls the heading tag only - the size
                            comes from the component, so changing it for outline reasons will not change the appearance.
                        </p>
                    </NumberHeading>
                </div>
            </Specimen>
        </Block>

        <Block
            title="Major table"
            note={
                <p>
                    Lists the released versions within one major, linking each to its migration guide or its archived
                    documentation. The rows are derived from the site&rsquo;s versions collection rather than authored,
                    so the table cannot go stale.
                </p>
            }
        >
            <Specimen
                label="Astro-only, so no live rendering here"
                code={`{% majorTable library="grid" major=33 /%}

<!-- type="archive" lists archived docs instead of migration guides -->
{% majorTable library="grid" major=32 type="archive" /%}`}
            />
        </Block>

        <Block
            title="Keyboard shortcuts"
            note={
                <p>
                    Both tags render the Mac and non-Mac label at build time and let{' '}
                    <code>html[data-os=&apos;mac&apos;]</code> decide which is visible, because a statically generated
                    page cannot know the visitor&rsquo;s OS. The non-Mac label is the one that shows with JavaScript
                    disabled.
                </p>
            }
        >
            <Specimen
                label="A single key, and a whole combination"
                code={`Press {% kbd "^ Ctrl" /%} to open the context menu.

Copy with {% kbdShortcut default="^ Ctrl+C" mac="⌘ Command+C" /%}`}
            >
                <p>
                    Press{' '}
                    <kbd>
                        <span className="kbd-default">^ Ctrl</span>
                        <span className="kbd-mac">&#8984; Command</span>
                    </kbd>{' '}
                    to open the context menu. Copy with{' '}
                    <span className="kbd-shortcut">
                        <span className="kbd-shortcut-default">
                            <kbd>^ Ctrl</kbd>+<kbd>C</kbd>
                        </span>
                        <span className="kbd-shortcut-mac">
                            <kbd>⌘ Command</kbd>+<kbd>C</kbd>
                        </span>
                    </span>
                    .
                </p>
            </Specimen>
        </Block>

        <Guidance
            dos={[
                <>
                    Use <code>{'{% kbd %}'}</code> with the <code>&ldquo;^ Ctrl&rdquo;</code> label exactly - it is the
                    one string the Mac swap table matches, so any other spelling renders identically on every platform.
                </>,
                <>
                    Prefer <code>{'{% kbdShortcut %}'}</code> for a combination. Writing three{' '}
                    <code>{'{% kbd %}'}</code> tags and typing the <code>+</code> between them produces the same markup
                    but no platform swap.
                </>,
                <>
                    Add a shared tag to <code>markdoc.config.ts</code> in every site that needs it. A tag that exists in{' '}
                    <code>ag-website-shared</code> but is unregistered fails at build time as an unknown tag.
                </>,
            ]}
            donts={[
                <>
                    Don&rsquo;t reach for <code>{'{% br %}'}</code> for spacing. It exists for addresses and verse, not
                    for pushing content apart - a paragraph break or the component&rsquo;s own margin is the fix.
                </>,
                <>
                    Don&rsquo;t hand-write HTML in a markdoc page where a tag exists. The tag picks up dark mode, the
                    responsive bounds and the anchor handling; a raw <code>&lt;img&gt;</code> picks up none of them.
                </>,
                <>
                    Don&rsquo;t number a <code>{'{% numberHeading %}'}</code> sequence by hand across pages - the number
                    is a string you supply, so a step inserted in the middle silently renumbers nothing.
                </>,
            ]}
        />

        <Gotcha>
            The <code>heading</code> node override is what puts the copy link on every documentation heading: it spreads
            markdoc&rsquo;s default heading schema - which is where the slug comes from - and swaps only the renderer
            for <code>Heading.astro</code>. Replacing rather than spreading it silently removes every anchor on the
            site, so the spread is load-bearing, not tidiness.
        </Gotcha>

        <KnownIssue>
            <p>
                <code>NumberHeading</code> imports <code>github-slugger</code>, which is not declared as a dependency of{' '}
                <code>ag-website-shared</code> or of any consuming site - it resolves only because something else in the
                tree hoists it to the root <code>node_modules</code>. It will break the moment that transitive
                dependency changes.
            </p>
            <p>
                <code>MajorTable.astro</code> accepts a <code>suppressChangelog</code> prop that the{' '}
                <code>majorTable</code> tag does not expose, so it is unreachable from a documentation page.
            </p>
        </KnownIssue>
    </Section>
);
