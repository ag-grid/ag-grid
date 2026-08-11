import { SESSIONS, sessionSlug } from '@utils/beyondThePromptSessions';
import { describe, expect, it } from 'vitest';

import { buildSessionMarkdown, sessionDescription } from './buildSessionMarkdown';

const SITE_ROOT = 'https://www.ag-grid.com/';

// The same filter the page's getStaticPaths applies: only recorded sessions get a page.
const RECORDED = SESSIONS.filter((session) => session.youtubeUrl);

describe('buildSessionMarkdown', () => {
    it('covers every recorded session', () => {
        expect(RECORDED.length).toBeGreaterThan(0);
        expect(new Set(RECORDED.map((session) => sessionSlug(session.title))).size).toBe(RECORDED.length);
    });

    describe.each(RECORDED.map((session) => [sessionSlug(session.title), session] as const))('%s', (_slug, session) => {
        const output = buildSessionMarkdown({ session, siteRoot: SITE_ROOT });

        it('emits frontmatter matching the page title and description, then the session as H1', () => {
            expect(output).toContain(`title: ${JSON.stringify(`${session.title} | Beyond the Prompt`)}`);
            expect(output).toContain(`description: ${JSON.stringify(sessionDescription(session))}`);
            expect(output).toContain(`# ${session.title}`);
        });

        it('links the recording and the parent Beyond the Prompt page', () => {
            expect(output).toContain(`[Watch the recording](${session.youtubeUrl})`);
            expect(output).toContain('https://www.ag-grid.com/community/beyond-the-prompt/');
        });

        it('ends with a single trailing newline', () => {
            expect(output.endsWith('\n')).toBe(true);
            expect(output.endsWith('\n\n')).toBe(false);
        });
    });

    it('lists the speakers with their roles, as the page does', () => {
        const withSpeakers = RECORDED.find((session) => session.speakers?.length);
        expect(withSpeakers).toBeDefined();
        const output = buildSessionMarkdown({ session: withSpeakers!, siteRoot: SITE_ROOT });
        const speaker = withSpeakers!.speakers![0];
        expect(output).toContain(`${speaker.name} (${speaker.role})`);
    });

    it('falls back to a generated description when the session has none', () => {
        expect(sessionDescription({ title: 'A Talk' })).toBe(
            'Watch "A Talk" from Beyond the Prompt, the AG Grid and Bryntum conference.'
        );
    });
});
