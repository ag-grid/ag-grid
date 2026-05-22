export interface BryntumCta {
    text: string;
    href: string;
    title?: string;
}

export interface BryntumLink {
    text: string;
    href: string;
}

export interface BryntumImageMedia {
    kind: 'image';
    src: string;
    alt?: string;
    width?: string;
    height?: string;
    src_original?: string;
}

export interface BryntumSvgMedia {
    kind: 'svg-inline';
    markup: string;
}

export interface BryntumVideoMedia {
    kind: 'video' | 'video-file';
    src?: string;
}

export type BryntumMedia = BryntumImageMedia | BryntumSvgMedia | BryntumVideoMedia;

export interface BryntumSectionBase {
    id?: string;
    modifiers?: string[];
    heading?: string;
}

export interface BryntumHeroSection extends BryntumSectionBase {
    type: 'heroTBM';
    eyebrow?: string;
    body_html?: string;
    body_text?: string;
    ctas?: BryntumCta[];
    media?: BryntumMedia[];
}

export interface BryntumLanguagesSection extends BryntumSectionBase {
    type: 'text-languages';
    body_text?: string;
    languages?: Array<{ name?: string; href?: string; icon?: string }>;
}

export interface BryntumTextMediaSection extends BryntumSectionBase {
    type: 'text-media' | 'white-section';
    body_html?: string;
    body_text?: string;
    links?: BryntumLink[];
    ctas?: BryntumCta[];
    media?: BryntumMedia[];
}

export interface BryntumLiveDemoSection extends BryntumSectionBase {
    type: 'live-demo';
    demo_src?: string | null;
    media?: BryntumMedia[];
}

export interface BryntumColumnsLibSection extends BryntumSectionBase {
    type: 'columns-lib';
    items: Array<{
        heading?: string;
        href?: string;
        body_text?: string;
        media?: BryntumMedia;
    }>;
}

export interface BryntumColumnsWithMediaSection extends BryntumSectionBase {
    type: 'columnsWithMedia';
    items: Array<{
        heading?: string;
        href?: string;
        body_text?: string;
        media?: BryntumMedia | null;
    }>;
}

export interface BryntumBrandsSection extends BryntumSectionBase {
    type: 'brands';
    items: Array<{
        href?: string;
        label?: string;
        media: BryntumMedia;
    }>;
}

export interface BryntumTextButtonSection extends BryntumSectionBase {
    type: 'text-button';
    body_html?: string;
    body_text?: string;
    ctas?: BryntumCta[];
}

export interface BryntumPartnershipSection extends BryntumSectionBase {
    type: 'partnership';
    body_html?: string;
    body_text?: string;
    logo_light_src?: string;
    logo_dark_src?: string;
    logo_alt?: string;
}

export interface BryntumTextMiniDemoSection extends BryntumSectionBase {
    type: 'text-mini-demo';
    body_html?: string;
    body_text?: string;
    ctas?: BryntumCta[];
    demo_kind?: 'gantt' | 'calendar';
    demo_position?: 'right' | 'left' | 'below';
}

export type BryntumSection =
    | BryntumHeroSection
    | BryntumLanguagesSection
    | BryntumTextMediaSection
    | BryntumLiveDemoSection
    | BryntumColumnsLibSection
    | BryntumColumnsWithMediaSection
    | BryntumBrandsSection
    | BryntumTextButtonSection
    | BryntumPartnershipSection
    | BryntumTextMiniDemoSection;

export interface BryntumCampaignContent {
    url?: string;
    slug: string;
    title: string;
    meta?: {
        description?: string;
        og_title?: string;
        og_description?: string;
    };
    sections: BryntumSection[];
}
