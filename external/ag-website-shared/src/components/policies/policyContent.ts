/**
 * Prose for the legal/policy pages that lives outside their `.mdoc` bodies — the page heading,
 * the effective-date block and the introductory paragraphs above the numbered sections.
 *
 * Kept here rather than inline in the `.astro` wrappers so the pages and their markdown twins
 * (see `@ag-website-shared/markdown-pages/policies/buildPolicyMarkdown`) render the same copy and
 * cannot drift. The numbered body of each policy stays in `@ag-website-shared/content/policies/*.mdoc`.
 *
 * `{name}` in a heading or description is replaced with the product name the page is rendered for
 * ("AG Grid", "AG Charts"), so one definition serves every site.
 */
export interface PolicyContent {
    /** Page `<h1>`, also the markdown twin's H1. */
    heading: string;
    /** `<title>` suffix — the Layout renders `<product>: <metaTitle>`. */
    metaTitle: string;
    /** Meta description, shared with the twin's frontmatter. */
    description: string;
    /** The dated preamble above the intro paragraphs, e.g. `Effective Date: 6 July 2022`. */
    meta: string[];
    /** Introductory paragraphs, as inline HTML (`<strong>` only). */
    intro: string[];
    /** Framing for a data-driven section rendered below the policy body (the cookie inventory). */
    cookiesSection?: {
        id: string;
        heading: string;
        note: string;
    };
}

export const POLICY_CONTENT = {
    privacy: {
        heading: '{name} Privacy Policy',
        metaTitle: 'Privacy Policy',
        description:
            'We take your privacy very seriously at AG Grid. This page outlines our privacy policy which we have updated in light of GDPR.',
        meta: ['Effective Date: 6 July 2022'],
        intro: [
            "Welcome to AG Grid's Privacy Policy.",
            '<strong>Your privacy is important to us.</strong>',
            'At ag-grid, we are fully committed to protecting your personal data and complying with all data privacy laws.',
            'This policy serves as a guide and reference point for how we may collect and use personal information, and the rights and choices available to all our visitors and customers.',
            'We strongly recommend you read our policy and understand what we collect, how we collect it, what we do with it, how we protect it, and your rights regarding information, <strong>before</strong> you use or access any of our services.',
        ],
    },
    cookies: {
        heading: 'Cookies Policy',
        metaTitle: 'Cookies Policy',
        description: 'This page outlines our policy in relation to the cookies that we collect on our website.',
        meta: ['Effective Date: May 17, 2018'],
        intro: [],
        /**
         * The cookie inventory rendered below the policy body, from
         * `@ag-website-shared/content/policies/cookies-data-*.json` (AG-18105). Shared so the
         * `CookiesTable` section on the page and the `/cookies.md` twin carry the same framing.
         */
        cookiesSection: {
            id: 'cookies-we-use',
            heading: 'Cookies We Use',
            note: 'The cookies listed below were last reviewed on 7 August 2026.',
        },
    },
    'modern-slavery': {
        heading: '{name} Modern Slavery and Human Trafficking Statement',
        metaTitle: 'Modern Slavery and Human Trafficking Statement',
        description:
            'AG Grid Ltd has a zero-tolerance approach to modern slavery. We are committed to acting ethically and with integrity in all our business dealings and relationships and to implementing and enforcing effective systems and controls to ensure modern slavery is not taking place anywhere in our own business or in any of our supply chains.',
        meta: [
            '<strong>For the Financial Year Ending 31 December 2026</strong>',
            '<strong>Version:</strong> 1.0',
            '<strong>Effective Date:</strong> 01 January 2026',
        ],
        intro: [],
    },
} as const satisfies Record<string, PolicyContent>;

export type PolicyName = keyof typeof POLICY_CONTENT;

/** Resolve `{name}` placeholders against the product the page is rendered for. */
export function policyHeading(policy: PolicyName, name: string): string {
    return POLICY_CONTENT[policy].heading.replace('{name}', name);
}
