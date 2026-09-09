import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import { PAGE_CONTENT, SESSIONS, SPEAKERS } from '@utils/beyondThePromptSessions';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

import { buildGridFrontmatter } from './gridFrontmatter';

/**
 * Build the markdown twin of /community/beyond-the-prompt: the AG Grid × Bryntum conference on
 * building AI-assisted applications that hold up in production. The prose, programme and speakers
 * are read from the shared content the page renders (also used by the per-session recording
 * routes), so the twin cannot drift; each session lists its speakers and links to its recording.
 */
export function buildCommunityBeyondThePromptMarkdown({ siteRoot }: { siteRoot?: string } = {}): string {
    const frontmatter = buildGridFrontmatter({
        pageUrl: '/community/beyond-the-prompt/',
        siteRoot,
        title: 'Beyond the Prompt: AG Grid & Bryntum Conference',
        description:
            'A one-day conference from AG Grid and Bryntum on building AI-assisted applications that hold up in production.',
    });

    const { intro, programme, notify } = PAGE_CONTENT;

    const sessions = SESSIONS.map((session) => {
        const speakers = (session.speakers ?? []).map((speaker) => `${speaker.name} (${speaker.role})`).join(', ');
        const who = speakers ? ` — ${speakers}` : '';
        const description = session.description ? `: ${session.description}` : '';
        const recording = session.youtubeUrl ? ` ([recording](${session.youtubeUrl}))` : '';
        return `- **${session.title}**${who}${description}${recording}`;
    }).join('\n');

    const speakers = SPEAKERS.map((speaker) => `### ${speaker.name} — ${speaker.title}\n\n${speaker.bio}`).join('\n\n');

    // The signup form is a Mailchimp embed; link to the section that hosts it instead.
    const signupUrl = toAbsoluteUrl(urlWithBaseUrl('/community/beyond-the-prompt/#notify'), siteRoot);

    const document = [
        frontmatter,
        '# Beyond the Prompt',
        `## ${intro.heading}`,
        ...intro.body,
        `## Programme\n\n${programme.location}\n\n${sessions}`,
        `## Speakers\n\n${programme.speakersLead}\n\n${speakers}`,
        `## ${notify.heading}\n\n${notify.location}\n\n${notify.lead}\n\n[Sign up for updates](${signupUrl})`,
    ].join('\n\n');

    return `${document.trimEnd()}\n`;
}
