import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import type { Session } from '@utils/beyondThePromptSessions';
import { sessionDurationMins, sessionSlug } from '@utils/beyondThePromptSessions';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

import { buildGridFrontmatter } from './gridFrontmatter';

/** The page's description fallback, shared so the twin's frontmatter matches the page's meta. */
export function sessionDescription(session: Session): string {
    return (
        session.description ?? `Watch "${session.title}" from Beyond the Prompt, the AG Grid and Bryntum conference.`
    );
}

/**
 * Build the markdown twin of a `/session/<slug>` recording page. Reads the same `SESSIONS` entry
 * the page renders, so title, speakers, description and recording link cannot drift. The page's
 * embedded YouTube player becomes a plain link to the recording — the closest markdown can get.
 */
export function buildSessionMarkdown({ session, siteRoot }: { session: Session; siteRoot?: string }): string {
    const description = sessionDescription(session);
    const durationMins = sessionDurationMins(session);

    const document: string[] = [
        buildGridFrontmatter({
            pageUrl: `/session/${sessionSlug(session.title)}/`,
            siteRoot,
            title: `${session.title} | Beyond the Prompt`,
            description,
        }),
        `# ${session.title}`,
    ];

    if (session.speakers?.length) {
        document.push(session.speakers.map((speaker) => `${speaker.name} (${speaker.role})`).join(', '));
    }
    if (durationMins != null) {
        document.push(`Duration: ${durationMins} minutes`);
    }
    if (session.youtubeUrl) {
        document.push(`[Watch the recording](${session.youtubeUrl})`);
    }
    if (session.description) {
        document.push(session.description);
    }
    document.push(
        `[← Back to Beyond the Prompt](${toAbsoluteUrl(urlWithBaseUrl('/community/beyond-the-prompt/'), siteRoot)})`
    );

    return `${document.join('\n\n').trimEnd()}\n`;
}
