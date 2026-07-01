import type { InternalFramework } from '@ag-grid-types';

// ============================================================================
// Section Content Types
// ============================================================================

export interface HeroCta {
    text: string;
    url?: string;
}

export interface HeroGalleryExample {
    /** Display title shown in the gallery */
    title: string;
    /** Gallery example name or docs example reference */
    exampleName: string;
    /** Optional: docs page name if this is a docs example (not gallery) */
    pageName?: string;
    /** Thumbnail image URL for navigation */
    thumbnail?: string;
}

export interface HeroSection {
    type: 'hero';
    variant?: 'default' | 'enterprise';
    tag: string;
    heading: string;
    /**
     * HTML heading with formatting. If provided, takes precedence over heading.
     * Use for framework pages that need framework logos in headings.
     */
    headingHtml?: string;
    /** Plain text subheading */
    subHeading: string;
    /**
     * HTML subheading with formatting. If provided, takes precedence over subHeading.
     * Use for framework pages that need: "Add <b>high-performance</b>..." template
     */
    subHeadingHtml?: string;
    showVersionBadge?: boolean;
    /** Whether to show customer logos in the hero section (default: true) */
    showCustomerLogos?: boolean;
    /** Secondary CTA link below the demo (e.g., "View All Demos") */
    secondaryCta?: HeroCta;
    /** Demo grid configuration (AG Grid specific) */
    demo?: {
        enableRowGroup?: boolean;
        gridHeight?: number;
    };
    /** Gallery examples for sliding gallery (AG Charts specific) */
    galleryExamples?: HeroGalleryExample[];
    /** Height of the hero demo */
    demoHeight?: number;
}

export interface FeatureItem {
    id: string;
    title: string;
    isEnterprise?: boolean;
    example: {
        pageName: string;
        exampleName: string;
    };
    features: Array<{
        heading: string;
        detail: string;
        link?: string;
    }>;
    docsLink: string;
}

export interface FeaturesSection {
    type: 'features';
    tag: string;
    heading: string;
    headingHtml?: string;
    subHeading: string;
    items: FeatureItem[];
}

export interface ShowcaseSection {
    type: 'showcase';
    tag: string;
    heading: string;
    subHeading: string;
}

export interface CustomersSection {
    type: 'customers';
    tag: string;
    headingHtml: string;
    subHeadingHtml: string;
    displayLogos?: boolean;
}

export interface ExampleItem {
    img: string;
    imgAlt: string;
    title: string;
    content: string;
    docs: string;
    demo: string;
}

export interface ExamplesSection {
    type: 'examples';
    tag: string;
    heading: string;
    subHeading: string;
    showBackgroundGradient?: boolean;
    items: ExampleItem[];
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface FAQSection {
    type: 'faq';
    tag: string;
    heading: string;
    subHeading: string;
    items: FAQItem[];
}

export interface ContactSection {
    type: 'contact';
    variant?: 'default' | 'sales';
    tag: string;
    heading: string;
    subHeading: string;
    features: string[];
}

export interface IntegratedChartsSection {
    type: 'integrated-charts';
    tag: string;
    heading?: string;
    headingHtml?: string;
    subHeading?: string;
    subHeadingHtml?: string;
    showBackgroundGradient?: boolean;
}

export interface ThemeBuilderSection {
    type: 'theme-builder';
    tag: string;
    heading: string;
    subHeading: string;
}

export interface ComparisonSection {
    type: 'comparison';
    tag: string;
    heading: string;
    subHeading: string;
    showBackgroundGradient?: boolean;
}

export interface PricingCard {
    title: string;
    price: string;
    priceNote: string;
    features: string[];
    ctaText: string;
    ctaUrl: string;
    ctaId?: string;
    isPrimary?: boolean;
    showTrialButton?: boolean;
}

export interface PricingSection {
    type: 'pricing';
    tag: string;
    heading: string;
    subHeading: string;
    showBackgroundGradient?: boolean;
    cards: PricingCard[];
}

// Union of all section types
export type LandingPageSectionType =
    | HeroSection
    | FeaturesSection
    | ShowcaseSection
    | CustomersSection
    | ExamplesSection
    | FAQSection
    | ContactSection
    | IntegratedChartsSection
    | ThemeBuilderSection
    | ComparisonSection
    | PricingSection;

// ============================================================================
// Landing Page Content
// ============================================================================

export interface LandingPageContent {
    meta: {
        title: string;
        description: string;
    };
    /** Product name for display (e.g., 'AG Grid', 'AG Charts') */
    productName?: string;
    /** Framework identifier for examples (e.g., 'reactFunctionalTs', 'angular', 'vue3') */
    internalFramework: InternalFramework;
    packageName?: string;
    docsPath: string;
    analyticsPrefix: string;
    sections: LandingPageSectionType[];
}

// ============================================================================
// Helper type to extract section by type
// ============================================================================

export type ExtractSection<T extends LandingPageSectionType['type']> = Extract<LandingPageSectionType, { type: T }>;
