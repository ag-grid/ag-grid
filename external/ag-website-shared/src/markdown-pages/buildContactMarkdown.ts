import { CONTACT_CONTENT, contactSocialLinks } from '@ag-website-shared/components/contact-us/contactContent';

/**
 * Build the markdown twin of the contact page. The page's substance is an interactive form, which
 * markdown cannot carry — so the twin renders the same headline and standfirst, then points at the
 * form and the support channels that ARE reachable without a browser.
 *
 * Product-agnostic: AG Grid, AG Charts and AG Studio share this module and differ only in the
 * `library` they pass (which selects the GitHub repository).
 */
export function buildContactMarkdown({ library, contactUrl }: { library: string; contactUrl: string }): string {
    const document = [
        [
            '---',
            `title: ${JSON.stringify(CONTACT_CONTENT.title)}`,
            `description: ${JSON.stringify(CONTACT_CONTENT.description)}`,
            '---',
        ].join('\n'),
        `# ${CONTACT_CONTENT.headline}`,
        `*${CONTACT_CONTENT.eyebrow}*`,
        CONTACT_CONTENT.subhead,
        `The contact form is on the page itself: [${CONTACT_CONTENT.headline}](${contactUrl}).`,
        '## Elsewhere',
        contactSocialLinks(library)
            .map(({ label, url }) => `- [${label}](${url})`)
            .join('\n'),
    ];

    return `${document.join('\n\n').trimEnd()}\n`;
}
