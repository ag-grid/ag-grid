/** One demo in the page's feature list, which doubles as the switcher between demos. */
export interface DemoPageExample {
    id: string;
    title: string;
    /** Base-relative page path, e.g. './example'. */
    path: string;
    /** Short supporting copy shown beneath the title. */
    description: string;
}

/** A call to action rendered beneath the feature list. */
export interface DemoPageCta {
    label: string;
    href: string;
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
}
