/** One demo in the page's feature list, which doubles as the switcher between demos. */
export interface DemoPageExample {
    id: string;
    title: string;
    /** Base-relative page path, e.g. './example'. */
    path: string;
    /** Short supporting copy shown beneath the title. */
    description: string;
    /**
     * Base-relative path to a screenshot of the demo, shown on its switcher button. One image
     * whatever the site's theme: each demo app has a fixed appearance of its own.
     */
    image?: string;
}

/** A call to action rendered beneath the feature list. */
export interface DemoPageCta {
    label: string;
    href: string;
}

/** A runnable seed project for the current demo, in one framework. */
export interface DemoPageOpenIn {
    /** Framework the seed is written in, as shown to the reader (e.g. 'React'). */
    framework: string;
    /** Opens the seed project in StackBlitz. */
    href: string;
    /** The seed project's source folder on GitHub, at the tag matching the site's version. */
    sourceHref: string;
}

/** The consuming site's copy for the demo page hero. */
export interface DemoPageHero {
    /** Small uppercase label above the title. */
    eyebrow: string;
    /** Main hero heading. */
    title: string;
    /** Supporting paragraph beneath the heading. */
    description: string;
    primaryCta: DemoPageCta;
    secondaryCta: DemoPageCta;
    /**
     * Seed projects for the current demo, one per framework, rendered beneath the CTAs as an
     * "Open in StackBlitz" and a "See on GitHub" button that each list the frameworks, in this
     * order. Omitted when the demo has none.
     */
    openIn?: DemoPageOpenIn[];
}
