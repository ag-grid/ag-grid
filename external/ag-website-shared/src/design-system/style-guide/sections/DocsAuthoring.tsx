import { NumberHeading } from '@ag-website-shared/components/number-heading/NumberHeading';
import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Guidance, Section } from '../chrome/Section';
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
            note={<p>Every shared tag, and whether this site has it registered. Site-only tags are not listed.</p>}
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
                    A numbered step with a rule connecting it to the next one, for instructions where the order is the
                    content. It appears in the page&rsquo;s side navigation like any other heading.
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
                        <p>Run the install command for your package manager.</p>
                    </NumberHeading>
                    <NumberHeading number="2" title="Register a licence key" level="h3">
                        <p>Set the key before the grid is created.</p>
                    </NumberHeading>
                </div>
            </Specimen>
        </Block>

        <Block
            title="Major table"
            note={
                <p>
                    Lists the released versions within one major, linking each to its migration guide or its archived
                    documentation.
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
            note={<p>Readers on a Mac see the Mac keys; everyone else sees the Windows and Linux keys.</p>}
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

        <Block title="Usage">
            <Guidance
                dos={[
                    <>
                        Use <code>{'{% kbdShortcut %}'}</code> for a key combination, so Mac readers see their own keys.
                    </>,
                    <>
                        Write the Ctrl key as <code>&ldquo;^ Ctrl&rdquo;</code> exactly, so it swaps on a Mac.
                    </>,
                    <>Use a number heading only where the order of the steps is the content.</>,
                ]}
                donts={[
                    <>
                        Don&rsquo;t use <code>{'{% br %}'}</code> for spacing.
                    </>,
                    <>Don&rsquo;t hand-write HTML in a page where a tag exists.</>,
                ]}
            />
        </Block>
    </Section>
);
