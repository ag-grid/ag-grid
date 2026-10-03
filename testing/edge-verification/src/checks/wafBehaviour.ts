import { header } from '../core/http';
import { type CheckDef, Problems } from '../core/types';
import { WWW } from '../expected/redirects';
import { AGENT_403_TEXT, UA, WAF_PROBES } from '../expected/wafProbes';

export function wafBehaviourChecks(): CheckDef[] {
    return WAF_PROBES.map((probe) => ({
        id: `waf-behaviour.${probe.id}`,
        area: 'waf-behaviour',
        title: probe.title,
        refs: probe.refs,
        pending: probe.pending,
        knownIssue: probe.knownIssue,
        fixedBy: probe.fixedBy,
        async run({ http }) {
            const headers: Record<string, string> = {};
            if (probe.ua) {
                headers['user-agent'] = UA[probe.ua];
            }
            if (probe.accept) {
                headers.accept = probe.accept;
            }
            const res = await http.request({ url: `${WWW}${probe.path}`, headers });
            const action = header(res, 'x-amzn-waf-action');
            const type = header(res, 'content-type') ?? '';
            const p = new Problems();
            const exp = probe.expect;
            if (exp === 'agent-403') {
                p.eq('status', res.status, 403);
                p.check(res.body.includes(AGENT_403_TEXT), 'body is not the automated-access-blocked guidance');
            } else if (exp === 'generic-403') {
                p.eq('status', res.status, 403);
                p.check(!res.body.includes(AGENT_403_TEXT), 'got the agent guidance body instead of a plain block');
            } else if (exp === 'site-404') {
                p.eq('status', res.status, 404);
                p.check(
                    /^text\/html/.test(type) && /<html/i.test(res.body) && !/Request blocked/i.test(res.body),
                    'not the site 404 page'
                );
            } else if (exp === 'challenge') {
                p.check(res.status === 202 || res.status === 405, `status ${res.status}, expected 202/405 challenge`);
                p.eq('x-amzn-waf-action', action, 'challenge');
            } else {
                p.eq('status', res.status, exp.status);
                if (exp.contentType) {
                    p.check(type.startsWith(exp.contentType), `content-type ${type}`);
                }
            }
            return p.outcome(`${res.status}${action ? ` (waf: ${action})` : ''}`);
        },
    }));
}
