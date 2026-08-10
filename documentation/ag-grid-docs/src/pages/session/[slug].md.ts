import { DISABLE_MARKDOWN_DOCS, SITE_URL } from '@constants';
import { SESSIONS, type Session, sessionSlug } from '@utils/beyondThePromptSessions';
import { buildSessionMarkdown } from '@utils/markdown-pages/buildSessionMarkdown';

// Served at /session/<slug>.md — the markdown twin of each recorded session page, built from
// the same SESSIONS entry the page renders. Mirrors the page's own getStaticPaths so the two
// URL sets line up 1:1. Content-negotiates from the HTML URL on Accept: text/markdown
// (see the SE-80 rules in htaccessRules.ts).
export function getStaticPaths() {
    if (DISABLE_MARKDOWN_DOCS) {
        return [];
    }
    return SESSIONS.filter((session) => session.youtubeUrl).map((session) => ({
        params: { slug: sessionSlug(session.title) },
        props: { session },
    }));
}

export function GET({ props }: { props: { session: Session } }) {
    return new Response(buildSessionMarkdown({ session: props.session, siteRoot: SITE_URL }), {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
}
