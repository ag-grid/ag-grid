import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { CopyButton } from '../chrome/CopyButton';
import { Block, Gotcha, Guidance, KnownIssue, Section } from '../chrome/Section';
import { Specimen } from '../chrome/Specimen';

/**
 * The image and video attributes, with what each is actually for.
 *
 * Written out as a table rather than prose because the two image tags have overlapping but
 * different attribute sets, and the difference is the reason to pick one over the other.
 */
const IMAGE_ATTRIBUTES = [
    { name: 'imagePath', tags: 'both', use: 'Path relative to the page folder. Required.' },
    { name: 'alt', tags: 'both', use: 'Required on both tags - there is no decorative escape hatch.' },
    { name: 'pageName', tags: 'both', use: 'Overrides the folder to resolve against. Defaults to the markdoc page.' },
    { name: 'width / height', tags: 'both', use: 'Intrinsic size. Set both where you know them, to reserve space.' },
    { name: 'minWidth / maxWidth', tags: 'both', use: 'Bounds for a responsive image.' },
    { name: 'margin', tags: 'image', use: 'Spacing override. The captioned variant handles its own spacing.' },
    { name: 'centered', tags: 'imageCaption', use: 'Centres the figure in the content column.' },
    {
        name: 'constrained',
        tags: 'imageCaption',
        use: 'Holds the figure to the text measure rather than letting it run full width.',
    },
    {
        name: 'enableDarkModeFilter',
        tags: 'imageCaption',
        use: 'CSS-filters the image for dark mode, instead of shipping a second asset.',
    },
    { name: 'id', tags: 'imageCaption', use: 'Anchor for the figure. Generated from the image path when omitted.' },
] as const;

/** Media: the image and video components, all of which are markdoc-first. */
export const Media: FunctionComponent = () => (
    <Section
        id="media"
        title="Images and video"
        source={[
            'components/image/Image.astro',
            'components/imageCaption/ImageCaption.astro',
            'components/video/Video.tsx',
        ]}
        lede={
            <p>
                Every media component here is an Astro component reached through a markdoc tag, so none of them can be
                rendered in this guide - the specimens below are the authoring syntax. What they share is that{' '}
                <code>alt</code> is mandatory and dark mode is the caller&rsquo;s problem.
            </p>
        }
    >
        <Block
            title="Images"
            note={
                <p>
                    <code>{'{% image %}'}</code> is a bare image; <code>{'{% imageCaption %}'}</code> adds a visible
                    caption taken from the tag body, plus dark-mode handling and the responsive bounds. Use the
                    captioned one when the image needs explaining, the bare one when it does not - a caption that
                    restates the <code>alt</code> text is noise read twice.
                </p>
            }
        >
            <Specimen
                label={
                    <>
                        <code>{'{% image %}'}</code> - no caption
                    </>
                }
                code={`{% image imagePath="row-grouping" alt="Rows grouped by country" maxWidth="640px" /%}`}
            />
            <Specimen
                label={
                    <>
                        <code>{'{% imageCaption %}'}</code> - caption from the tag body
                    </>
                }
                code={`{% imageCaption imagePath="pivot-mode" alt="The pivot mode toggle" centered=true constrained=true %}
The pivot toggle appears in the columns tool panel only when pivot mode is enabled.
{% /imageCaption %}`}
            />

            <div className={styles.tableScroll}>
                <table className={styles.tokenTable}>
                    <thead>
                        <tr>
                            <th scope="col">Attribute</th>
                            <th scope="col">Tag</th>
                            <th scope="col">Use</th>
                        </tr>
                    </thead>
                    <tbody>
                        {IMAGE_ATTRIBUTES.map(({ name, tags, use }) => (
                            <tr key={name}>
                                <th scope="row">
                                    <CopyButton value={name} label={name} inline />
                                </th>
                                <td data-column="Tag">{tags}</td>
                                <td data-column="Use">{use}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Block>

        <Block
            title="Dark mode"
            note={
                <>
                    <p>
                        There are two mechanisms and they are not equivalent. Shipping a second asset named with a{' '}
                        <code>-dark</code> suffix beside the original swaps the whole image;{' '}
                        <code>enableDarkModeFilter</code> inverts the one asset with a CSS filter.
                    </p>
                    <p>
                        <strong>
                            Both are <code>{'{% imageCaption %}'}</code> only.
                        </strong>{' '}
                        <code>{'{% image %}'}</code> has no dark-mode handling of any kind, which is the main reason to
                        reach for the captioned tag even where the caption is barely needed.
                    </p>
                </>
            }
        >
            <Specimen
                label="Second asset - preferred for screenshots"
                code={`page-folder/
  pivot-mode.png
  pivot-mode-dark.png   <-- found by name, nothing to declare

{% imageCaption imagePath="pivot-mode" alt="…" %}…{% /imageCaption %}`}
            />
            <Specimen
                label="Filter - only for line art"
                code={`{% imageCaption imagePath="diagram" alt="…" enableDarkModeFilter=true %}…{% /imageCaption %}`}
            />
            <p>
                The asset swap is not a <code>&lt;picture&gt;</code> element - the component emits both paths as{' '}
                <code>data-light-src</code> and <code>data-dark-src</code> and a script in the consuming site&rsquo;s{' '}
                <code>public/scripts/image-caption-darkmode.js</code> switches <code>src</code> at runtime. As with{' '}
                <code>ExpandingSection</code>, that makes it a per-repo asset the shared component depends on without
                declaring, and it means the light image is what appears in the initial HTML.
            </p>
        </Block>

        <Block
            title="Video"
            note={
                <p>
                    <code>{'{% video %}'}</code> renders a short looping clip - a UI demonstration, not a talk. The
                    underlying <code>&lt;video&gt;</code> is always <code>muted</code> and <code>loop</code>, and{' '}
                    <code>autoplay</code> defaults to <code>true</code>, so it cannot carry audio narration and should
                    not carry anything that needs to be watched in order.
                </p>
            }
        >
            <Specimen
                label={
                    <>
                        <code>{'{% video %}'}</code>
                    </>
                }
                code={`{% video videoSrc="cell-editing.mp4" centered=true /%}

<!-- autoplay=false leaves it paused until the reader presses play -->
{% video videoSrc="cell-editing.mp4" autoplay=false /%}`}
            />
            <Specimen
                label="React props"
                code={`videoSrc: string             // required
darkModeVideoSrc?: string    // swapped in via useDarkmode
autoplay?: boolean           // default true
showPlayPauseButtons?: boolean // default true
centered?: boolean`}
            >
                <p>
                    <code>darkModeVideoSrc</code> is available on the React component but is <strong>not</strong> a
                    markdoc attribute, so a page-authored video cannot have a dark variant. The play and pause controls
                    are revealed on hover over the video.
                </p>
            </Specimen>
        </Block>

        <Guidance
            dos={[
                <>
                    Write <code>alt</code> as what the reader would miss - &ldquo;rows grouped by country, with the
                    group column pinned left&rdquo;, not &ldquo;screenshot of the grid&rdquo;.
                </>,
                <>
                    Set <code>maxWidth</code> on anything wider than the text measure, so a full-resolution screenshot
                    does not dominate the page.
                </>,
                <>
                    Prefer a real <code>-dark</code> asset over <code>enableDarkModeFilter</code> for anything
                    containing a screenshot of the grid - the filter inverts the data too.
                </>,
            ]}
            donts={[
                <>
                    Don&rsquo;t use a video where an image would do. It costs more to load, cannot be read by a screen
                    reader, and loops in the reader&rsquo;s peripheral vision while they read the surrounding prose.
                </>,
                <>
                    Don&rsquo;t put text in an image. It does not scale, translate, or survive dark mode, and it is
                    invisible to search.
                </>,
                <>
                    Don&rsquo;t leave the caption body empty just to get <code>centered</code> or the dark-mode swap -
                    the component renders the caption container unconditionally, so an empty body leaves an empty
                    element and its spacing behind.
                </>,
            ]}
        />

        <Gotcha>
            <code>imagePath</code> resolves relative to the markdoc page&rsquo;s own folder, not to a shared image
            directory - so moving a page moves its images with it, and two pages showing the same screenshot each need
            their own copy unless one of them passes <code>pageName</code> to point at the other&rsquo;s folder.
        </Gotcha>

        <KnownIssue>
            <p>
                <code>Video</code> renders <strong>both</strong> the play and the pause button at all times and hides
                one with <code>opacity: 0</code>. Opacity removes neither from the accessibility tree nor from hit
                testing, so a screen reader announces &ldquo;Play video&rdquo; and &ldquo;Pause video&rdquo; whatever
                the state, both are in the tab order, and because the two are absolutely positioned on top of each other
                the pause button takes every click. It happens to work - both handlers call the same toggle - but the
                control that looks pressable is not the one receiving the press.
            </p>
            <p>
                The state classes are inverted relative to their names: <code>styles.isPaused</code> is applied while
                the video <em>is playing</em>, and <code>styles.isPlaying</code> while it is paused. The rendering is
                correct - <code>.isPaused .pauseButton</code> reveals the pause control, which is what you want during
                playback - but anyone reading either file alone will conclude it is broken.
            </p>
            <p>
                Neither image component uses <code>&lt;figure&gt;</code>/<code>&lt;figcaption&gt;</code>, which is the
                markup this pattern exists for. <code>ImageCaption.astro</code> emits a <code>&lt;div&gt;</code>
                wrapping an <code>&lt;img&gt;</code> and a second <code>&lt;div&gt;</code> for the caption, so the
                association between the two is visual only and is not conveyed to assistive technology.
            </p>
            <p>
                <code>touchimage.ts</code> exports a <code>touchImage</code> tag that no <code>markdoc.config.ts</code>{' '}
                in this repo registers, so <code>TouchImage.astro</code> is unreachable from grid documentation. It may
                still be wired up in the Charts or Studio sites, which keep their own tag registries.
            </p>
        </KnownIssue>
    </Section>
);
