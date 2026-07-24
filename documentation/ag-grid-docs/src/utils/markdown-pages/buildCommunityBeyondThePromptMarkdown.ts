import { SESSIONS } from '@utils/beyondThePromptSessions';

/**
 * Build the markdown twin of /community/beyond-the-prompt: the AG Grid × Bryntum conference on
 * building AI-assisted applications that hold up in production. The programme is read from the
 * shared SESSIONS data (also used by the page and the per-session recording routes), so the
 * agenda cannot drift; each session lists its speakers and links to its recording.
 */
export function buildCommunityBeyondThePromptMarkdown(_options: { siteRoot?: string } = {}): string {
    const frontmatter = [
        '---',
        'title: "Beyond the Prompt: AG Grid & Bryntum Conference"',
        'description: "A one-day conference from AG Grid and Bryntum on building AI-assisted applications that hold up in production."',
        '---',
    ].join('\n');

    const programme = SESSIONS.map((session) => {
        const speakers = (session.speakers ?? []).map((speaker) => `${speaker.name} (${speaker.role})`).join(', ');
        const who = speakers ? ` — ${speakers}` : '';
        const description = session.description ? `: ${session.description}` : '';
        const recording = session.youtubeUrl ? ` ([recording](${session.youtubeUrl}))` : '';
        return `- **${session.title}**${who}${description}${recording}`;
    }).join('\n');

    const document = [
        frontmatter,
        '# Beyond the Prompt',
        'A one-day conference on building applications that hold up in production, hosted by AG Grid and Bryntum. Beyond the Prompt explores the tension between how easy it is to prototype with AI and how hard it is to make that work hold up in production.',
        `## Programme\n\n${programme}`,
    ].join('\n\n');

    return `${document.trimEnd()}\n`;
}
