/**
 * A small model of how Apache 2.4 applies the .htaccess files this site generates, so the tests
 * can assert behaviour (which status and Location a request gets, which headers a response
 * carries) rather than restating rule text. Test-only: nothing in the build imports it.
 *
 * It models the subset of directives the generators emit, with the semantics that have caught
 * real bugs:
 *
 * - mod_rewrite in a per-directory context: the RewriteRule pattern sees the path BELOW the
 *   .htaccess directory, while %{REQUEST_URI} is always the full path. Only the deepest
 *   .htaccess with rewrite rules applies (a child's rewrite block REPLACES its parent's unless it
 *   asks to inherit, which is why the root's /charts/ rules never ran under /charts/).
 *   Conditions ([OR], [NC], negation, -f), back-references ($N, %N), [L], [R=nnn], [G],
 *   [NE], [S=n], internal rewrites (re-run as a new request) and the Vary header mod_rewrite adds
 *   when a condition on a request header holds.
 * - mod_alias: Redirect (prefix match on whole path segments, remainder appended) and
 *   RedirectMatch (regex on the full path), first match wins, the child's directives before the
 *   parent's. mod_rewrite runs first (its fixup hook is registered before mod_alias's).
 * - mod_headers: Header set/append/add/unset with expr= conditions, `always` vs onsuccess
 *   tables, and <If> sections, which Apache merges after every plain section - so all plain
 *   directives (parent, then child) apply before any <If> block (parent's, then child's).
 *   RequestHeader edit/edit* (regex substitution on each instance of a request header, parent
 *   then child), which runs before the handler evaluates conditional requests.
 *
 * Anything outside that subset throws rather than being silently ignored. The real-Apache
 * harness in testing/htaccess-harness remains the authority on interactions this does not model
 * (mod_dir's DirectorySlash, the vhost, CloudFront).
 */

type Flags = Map<string, string | true>;

interface RewriteCond {
    testString: string;
    pattern: string;
    negate: boolean;
    regex?: RegExp;
    flags: Flags;
}

interface RewriteRule {
    pattern: RegExp;
    substitution: string;
    flags: Flags;
    conds: RewriteCond[];
    source: string;
}

interface AliasDirective {
    kind: 'Redirect' | 'RedirectMatch';
    status: number;
    from: string;
    regex?: RegExp;
    to?: string;
    source: string;
}

interface HeaderDirective {
    always: boolean;
    action: 'set' | 'append' | 'add' | 'unset' | 'merge';
    name: string;
    value?: string;
    expr?: string;
    source: string;
}

interface RequestHeaderDirective {
    /** `edit` substitutes the first match in each header value, `edit*` every match. */
    action: 'edit' | 'edit*';
    name: string;
    regex: RegExp;
    replacement: string;
    source: string;
}

export interface CompiledHtaccess {
    /** The directory the file is served from, with leading and trailing slash: `/` or `/archive/36.3.0/`. */
    dir: string;
    rewriteRules: RewriteRule[];
    hasRewrite: boolean;
    aliases: AliasDirective[];
    /** Plain (unconditional-section) header directives, in file order. */
    headers: HeaderDirective[];
    /** <If> sections, in file order. */
    ifSections: { expr: string; headers: HeaderDirective[] }[];
    /** RequestHeader directives, in file order. */
    requestHeaders: RequestHeaderDirective[];
    errorDocuments: Map<number, string>;
}

export interface SimRequest {
    /** Absolute URL, e.g. `http://ag-grid.com/react-data-grid/?a=1`. */
    url: string;
    accept?: string;
    /** Whether a docroot-relative URL path exists on disk, for `-f` conditions. Defaults to nothing existing. */
    fileExists?: (urlPath: string) => boolean;
}

export type RouteOutcome =
    | { type: 'redirect'; status: number; location: string; by: string }
    | { type: 'status'; status: number; by: string }
    | { type: 'serve'; path: string; query: string; vary: string[] };

export interface ResponseContext {
    /** %{REQUEST_URI} as Apache sees it when the response is built - after DirectoryIndex or ErrorDocument. */
    uri: string;
    status: number;
    contentType?: string;
    /**
     * Whether the onsuccess (non-`always`) table is sent. True for 2xx, and for a local ErrorDocument,
     * which Apache serves through an internal redirect (verified on staging for the Link header).
     */
    onSuccess?: boolean;
    /** Vary entries mod_rewrite added while routing. */
    varyFromRewrite?: string[];
}

const flagsOf = (raw: string | undefined): Flags => {
    const flags: Flags = new Map();
    for (const part of (raw ?? '').split(',').filter(Boolean)) {
        const [key, value] = part.split('=');
        flags.set(key.trim().toUpperCase(), value === undefined ? true : value.trim());
    }
    return flags;
};

/**
 * Splits a directive's arguments the way Apache does: whitespace separates them, double or single
 * quotes group them (with a backslash before the same quote the only escape removed), and a
 * backslash-escaped space stays in its token.
 */
export function tokenize(line: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    while (i < line.length) {
        while (i < line.length && /\s/.test(line[i])) {
            i++;
        }
        if (i >= line.length) {
            break;
        }
        let token = '';
        const quote = line[i];
        if (quote === '"' || quote === "'") {
            i++;
            while (i < line.length && line[i] !== quote) {
                if (line[i] === '\\' && line[i + 1] === quote) {
                    i++;
                }
                token += line[i++];
            }
            i++;
        } else {
            while (i < line.length && !/\s/.test(line[i])) {
                if (line[i] === '\\' && line[i + 1] === ' ') {
                    token += line[i++];
                }
                token += line[i++];
            }
        }
        tokens.push(token);
    }
    return tokens;
}

const parseHeader = (args: string[], source: string): HeaderDirective => {
    let i = 0;
    let always = false;
    if (args[i] === 'always' || args[i] === 'onsuccess') {
        always = args[i] === 'always';
        i++;
    }
    const action = args[i++] as HeaderDirective['action'];
    if (!['set', 'append', 'add', 'unset', 'merge'].includes(action)) {
        throw new Error(`Unsupported Header action: ${source}`);
    }
    const name = args[i++].toLowerCase();
    const value = action === 'unset' ? undefined : args[i++];
    const rest = args[i];
    let expr: string | undefined;
    if (rest !== undefined) {
        if (!rest.startsWith('expr=')) {
            throw new Error(`Unsupported Header condition: ${source}`);
        }
        expr = rest.slice('expr='.length);
    }
    if (args.length > i + 1) {
        throw new Error(`Unexpected Header arguments: ${source}`);
    }
    return { always, action, name, value, expr, source };
};

const parseRequestHeader = (args: string[], source: string): RequestHeaderDirective => {
    const [action, name, pattern, replacement, ...rest] = args;
    if ((action !== 'edit' && action !== 'edit*') || replacement === undefined || rest.length) {
        throw new Error(`Unsupported RequestHeader: ${source}`);
    }
    return { action, name: name.toLowerCase(), regex: new RegExp(pattern), replacement, source };
};

// ap_pregsub: `&` and `$0` are the whole match, `$1`-`$9` a group, a backslash escapes the next character.
const pregsub = (replacement: string, match: RegExpExecArray): string =>
    replacement.replace(/\\(.)|&|\$(\d)/g, (token, escaped: string | undefined, group: string | undefined) => {
        if (escaped !== undefined) {
            return escaped;
        }
        return match[token === '&' ? 0 : Number(group)] ?? '';
    });

// mod_headers' edit/edit*: substitute the first match, or every non-overlapping match.
const editValue = (directive: RequestHeaderDirective, value: string): string => {
    const regex = new RegExp(directive.regex.source, 'g');
    let result = '';
    let last = 0;
    for (let match = regex.exec(value); match; match = regex.exec(value)) {
        result += value.slice(last, match.index) + pregsub(directive.replacement, match);
        last = match.index + match[0].length;
        if (directive.action === 'edit' || !match[0].length) {
            break;
        }
    }
    return result + value.slice(last);
};

export function compileHtaccess(content: string, dir = '/'): CompiledHtaccess {
    const compiled: CompiledHtaccess = {
        dir,
        rewriteRules: [],
        hasRewrite: false,
        aliases: [],
        headers: [],
        ifSections: [],
        requestHeaders: [],
        errorDocuments: new Map(),
    };
    let pendingConds: RewriteCond[] = [];
    let currentIf: { expr: string; headers: HeaderDirective[] } | undefined;

    for (const raw of content.split('\n')) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) {
            continue;
        }
        const [directive, ...args] = tokenize(line);
        switch (directive) {
            case '<If': {
                currentIf = { expr: args[0].replace(/>$/, ''), headers: [] };
                break;
            }
            case '</If>': {
                compiled.ifSections.push(currentIf!);
                currentIf = undefined;
                break;
            }
            case '<ElseIf':
            case '<Else>':
            case '<Files':
            case '<FilesMatch':
            case 'RewriteBase':
            case 'RewriteOptions':
            case 'RewriteMap':
                throw new Error(`Unsupported directive: ${line}`);
            case 'RewriteEngine':
                compiled.hasRewrite = true;
                break;
            case 'RewriteCond': {
                const [testString, rawPattern, rawFlags] = args;
                const negate = rawPattern.startsWith('!');
                const pattern = negate ? rawPattern.slice(1) : rawPattern;
                const flags = flagsOf(rawFlags?.replace(/^\[|\]$/g, ''));
                const isFileTest = /^-[fdsl]$/.test(pattern);
                pendingConds.push({
                    testString,
                    pattern,
                    negate,
                    flags,
                    regex: isFileTest ? undefined : new RegExp(pattern, flags.has('NC') ? 'i' : ''),
                });
                break;
            }
            case 'RewriteRule': {
                const [pattern, substitution, rawFlags] = args;
                const flags = flagsOf(rawFlags?.replace(/^\[|\]$/g, ''));
                compiled.hasRewrite = true;
                compiled.rewriteRules.push({
                    pattern: new RegExp(pattern, flags.has('NC') ? 'i' : ''),
                    substitution,
                    flags,
                    conds: pendingConds,
                    source: line,
                });
                pendingConds = [];
                break;
            }
            case 'Redirect':
            case 'RedirectMatch': {
                const [status, from, to] = args;
                compiled.aliases.push({
                    kind: directive,
                    status: Number(status),
                    from,
                    regex: directive === 'RedirectMatch' ? new RegExp(from) : undefined,
                    to,
                    source: line,
                });
                break;
            }
            case 'Header': {
                const header = parseHeader(args, line);
                (currentIf ? currentIf.headers : compiled.headers).push(header);
                break;
            }
            case 'RequestHeader': {
                if (currentIf) {
                    throw new Error(`Unsupported RequestHeader inside <If>: ${line}`);
                }
                compiled.requestHeaders.push(parseRequestHeader(args, line));
                break;
            }
            case 'ErrorDocument':
                compiled.errorDocuments.set(Number(args[0]), args[1]);
                break;
            default:
                // AddType, AddCharset, Options, <IfModule> wrappers, mod_deflate: no routing or
                // header effect that this model needs.
                break;
        }
    }
    if (pendingConds.length) {
        throw new Error('RewriteCond without a following RewriteRule');
    }
    return compiled;
}

/** The files that apply to a URL path, root first. */
const applicableFiles = (files: CompiledHtaccess[], path: string): CompiledHtaccess[] =>
    files
        .filter((file) => path.startsWith(file.dir) || `${path}/` === file.dir)
        .sort((a, b) => a.dir.length - b.dir.length);

interface RewriteContext {
    host: string;
    https: boolean;
    uri: string;
    query: string;
    accept: string;
    fileExists: (urlPath: string) => boolean;
}

const expandVars = (value: string, ctx: RewriteContext, rule: RegExpMatchArray, cond: RegExpMatchArray | null) =>
    value
        .replace(/%\{([A-Z_]+)\}/g, (_, name: string) => {
            switch (name) {
                case 'HTTP_HOST':
                    return ctx.host;
                case 'REQUEST_URI':
                    return ctx.uri;
                case 'SERVER_PORT':
                    return ctx.https ? '443' : '80';
                case 'HTTPS':
                    return ctx.https ? 'on' : 'off';
                case 'HTTP_ACCEPT':
                    return ctx.accept;
                case 'QUERY_STRING':
                    return ctx.query;
                case 'DOCUMENT_ROOT':
                    return '';
                default:
                    throw new Error(`Unsupported server variable %{${name}}`);
            }
        })
        .replace(/\$(\d)/g, (_, n) => rule[Number(n)] ?? '')
        .replace(/%(\d)/g, (_, n) => cond?.[Number(n)] ?? '');

const HEADER_VARS: Record<string, string> = { HTTP_ACCEPT: 'Accept', HTTP_HOST: 'Host' };

type RewriteResult = { outcome: RouteOutcome | { type: 'rewrite'; path: string } | null; vary: string[] };

function runRewrite(file: CompiledHtaccess, ctx: RewriteContext): RewriteResult {
    const relative = ctx.uri === file.dir.slice(0, -1) ? '' : ctx.uri.slice(file.dir.length);
    const vary: string[] = [];
    let skip = 0;
    for (const rule of file.rewriteRules) {
        if (skip > 0) {
            skip--;
            continue;
        }
        const match = relative.match(rule.pattern);
        if (!match) {
            continue;
        }
        // Conditions: consecutive [OR] conditions form one group, and every group must hold.
        // %N refers to the most recent condition that matched.
        let lastCondMatch: RegExpMatchArray | null = null;
        let ok = true;
        let groupHolds = false;
        const ruleVary: string[] = [];
        for (const cond of rule.conds) {
            const testValue = expandVars(cond.testString, ctx, match, lastCondMatch);
            let holds: boolean;
            if (cond.regex) {
                const condMatch = testValue.match(cond.regex);
                holds = (condMatch !== null) !== cond.negate;
                if (condMatch && !cond.negate) {
                    lastCondMatch = condMatch;
                }
            } else if (cond.pattern === '-f') {
                holds = ctx.fileExists(testValue) !== cond.negate;
            } else {
                throw new Error(`Unsupported file test ${cond.pattern}`);
            }
            const headerVar = /^%\{([A-Z_]+)\}$/.exec(cond.testString)?.[1];
            if (holds && headerVar && HEADER_VARS[headerVar] && headerVar !== 'HTTP_HOST') {
                ruleVary.push(HEADER_VARS[headerVar]);
            }
            groupHolds = groupHolds || holds;
            if (!cond.flags.has('OR')) {
                ok = ok && groupHolds;
                groupHolds = false;
            }
        }
        if (!ok) {
            continue;
        }
        vary.push(...ruleVary);
        const skipCount = rule.flags.get('S');
        if (skipCount !== undefined) {
            skip = Number(skipCount);
        }
        if (rule.flags.has('G')) {
            return { outcome: { type: 'status', status: 410, by: rule.source }, vary };
        }
        const redirectFlag = rule.flags.get('R');
        const substitution = rule.substitution;
        if (redirectFlag !== undefined) {
            const status = redirectFlag === true ? 302 : Number(redirectFlag);
            if (status < 300 || status > 399) {
                return { outcome: { type: 'status', status, by: rule.source }, vary };
            }
            let location = expandVars(substitution, ctx, match, lastCondMatch);
            if (location.startsWith('/')) {
                location = `${ctx.https ? 'https' : 'http'}://${ctx.host}${location}`;
            }
            if (!rule.flags.has('NE')) {
                // Without [NE], mod_rewrite escapes the substitution, so a '#' becomes a literal %23.
                location = location.replace(/#/g, '%23');
            }
            if (ctx.query && !location.includes('?')) {
                location += `?${ctx.query}`;
            }
            return { outcome: { type: 'redirect', status, location, by: rule.source }, vary };
        }
        if (substitution !== '-') {
            const path = expandVars(substitution, ctx, match, lastCondMatch);
            if (!path.startsWith('/')) {
                throw new Error(`Unsupported relative internal rewrite: ${rule.source}`);
            }
            return { outcome: { type: 'rewrite', path }, vary };
        }
        if (rule.flags.has('L')) {
            break;
        }
    }
    return { outcome: null, vary };
}

// Apache's alias_matches: whole path segments, with runs of slashes treated as one.
function aliasMatchLength(uri: string, prefix: string): number {
    let u = 0;
    let a = 0;
    while (a < prefix.length) {
        if (prefix[a] === '/') {
            if (uri[u] !== '/') {
                return 0;
            }
            while (prefix[a] === '/') {
                a++;
            }
            while (uri[u] === '/') {
                u++;
            }
        } else if (uri[u++] !== prefix[a++]) {
            return 0;
        }
    }
    if (prefix[a - 1] !== '/' && u < uri.length && uri[u] !== '/') {
        return 0;
    }
    return u;
}

function runAliases(files: CompiledHtaccess[], ctx: RewriteContext): RouteOutcome | null {
    // mod_alias merges the child's directives in front of the parent's.
    const directives = [...files].reverse().flatMap((file) => file.aliases);
    for (const alias of directives) {
        let location: string | undefined;
        if (alias.kind === 'Redirect') {
            const length = aliasMatchLength(ctx.uri, alias.from);
            if (!length) {
                continue;
            }
            location = alias.to === undefined ? undefined : alias.to + ctx.uri.slice(length);
        } else {
            const match = ctx.uri.match(alias.regex!);
            if (!match) {
                continue;
            }
            location = alias.to?.replace(/\$(\d)/g, (_, n) => match[Number(n)] ?? '');
        }
        if (alias.status < 300 || alias.status > 399) {
            return { type: 'status', status: alias.status, by: alias.source };
        }
        if (location!.startsWith('/')) {
            location = `${ctx.https ? 'https' : 'http'}://${ctx.host}${location}`;
        }
        if (ctx.query && !location!.includes('?')) {
            location += `?${ctx.query}`;
        }
        return { type: 'redirect', status: alias.status, location: location!, by: alias.source };
    }
    return null;
}

/** What the docroot does with one request: a redirect, a bare status (410), or a file to serve. */
export function route(files: CompiledHtaccess[], request: SimRequest): RouteOutcome {
    const url = new URL(request.url);
    const vary: string[] = [];
    const ctx: RewriteContext = {
        host: url.host,
        https: url.protocol === 'https:',
        uri: decodeURIComponent(url.pathname),
        query: url.search.replace(/^\?/, ''),
        accept: request.accept ?? 'text/html',
        fileExists: request.fileExists ?? (() => false),
    };
    // Internal rewrites restart the request with the new path, as Apache's internal redirect does.
    for (let pass = 0; pass < 10; pass++) {
        const chain = applicableFiles(files, ctx.uri);
        const rewriteFile = [...chain].reverse().find((file) => file.hasRewrite);
        const rewritten = rewriteFile ? runRewrite(rewriteFile, ctx) : { outcome: null, vary: [] };
        vary.push(...rewritten.vary);
        if (rewritten.outcome?.type === 'rewrite') {
            ctx.uri = rewritten.outcome.path;
            continue;
        }
        if (rewritten.outcome) {
            return rewritten.outcome;
        }
        const aliased = runAliases(chain, ctx);
        if (aliased) {
            return aliased;
        }
        return { type: 'serve', path: ctx.uri, query: ctx.query, vary: [...new Set(vary)] };
    }
    throw new Error(`Internal rewrite loop for ${request.url}`);
}

export interface RedirectChain {
    hops: { url: string; status: number; location: string; by: string }[];
    final: { url: string; outcome: RouteOutcome | null };
}

/**
 * Follows redirects until a response that is not one. `handledHere` says whether a URL is served
 * by this docroot at all; one that is not (another site, or a reverse-proxied path) ends the chain
 * with a null outcome.
 */
export function followRedirects(
    files: CompiledHtaccess[],
    request: SimRequest,
    handledHere: (url: URL) => boolean = () => true,
    maxHops = 10
): RedirectChain {
    const hops: RedirectChain['hops'] = [];
    let current = request.url;
    for (let i = 0; i <= maxHops; i++) {
        if (!handledHere(new URL(current))) {
            return { hops, final: { url: current, outcome: null } };
        }
        const outcome = route(files, { ...request, url: current });
        if (outcome.type !== 'redirect') {
            return { hops, final: { url: current, outcome } };
        }
        hops.push({ url: current, status: outcome.status, location: outcome.location, by: outcome.by });
        current = outcome.location;
    }
    throw new Error(`Redirect loop: ${hops.map((hop) => hop.url).join(' -> ')}`);
}

// ---------------------------------------------------------------------------------------------
// ap_expr: the subset the generators emit. Unknown syntax throws.
// ---------------------------------------------------------------------------------------------

type ExprToken =
    | { kind: 'var'; name: string }
    | { kind: 'regex'; regex: RegExp }
    | { kind: 'num'; value: number }
    | { kind: 'str'; value: string }
    | { kind: 'op'; value: string };

function tokenizeExpr(expr: string): ExprToken[] {
    const tokens: ExprToken[] = [];
    let i = 0;
    while (i < expr.length) {
        const rest = expr.slice(i);
        let m: RegExpMatchArray | null;
        if (/^\s/.test(rest)) {
            i++;
        } else if ((m = rest.match(/^%\{([A-Z_]+)\}/))) {
            tokens.push({ kind: 'var', name: m[1] });
            i += m[0].length;
        } else if ((m = rest.match(/^m(.)/))) {
            const delimiter = m[1];
            const end = expr.indexOf(delimiter, i + 2);
            const body = expr.slice(i + 2, end);
            let j = end + 1;
            let flags = '';
            while (expr[j] === 'i') {
                flags += 'i';
                j++;
            }
            tokens.push({ kind: 'regex', regex: new RegExp(body, flags) });
            i = j;
        } else if ((m = rest.match(/^(-(?:eq|ne|lt|le|gt|ge)\b|=~|!~|==|!=|&&|\|\||<=|>=|[!()<>])/))) {
            tokens.push({ kind: 'op', value: m[1] });
            i += m[0].length;
        } else if ((m = rest.match(/^-?\d+/))) {
            tokens.push({ kind: 'num', value: Number(m[0]) });
            i += m[0].length;
        } else if ((m = rest.match(/^'([^']*)'/))) {
            tokens.push({ kind: 'str', value: m[1] });
            i += m[0].length;
        } else {
            throw new Error(`Unsupported ap_expr syntax at "${rest}" in ${expr}`);
        }
    }
    return tokens;
}

export function evaluateExpr(expr: string, vars: Record<string, string | number | undefined>): boolean {
    const tokens = tokenizeExpr(expr);
    let pos = 0;
    const peek = () => tokens[pos];
    const isOp = (value: string) => peek()?.kind === 'op' && (peek() as { value: string }).value === value;

    const operand = (): string | number => {
        const token = tokens[pos++];
        if (token?.kind === 'var') {
            if (!(token.name in vars)) {
                throw new Error(`Unsupported ap_expr variable %{${token.name}}`);
            }
            return vars[token.name] ?? '';
        }
        if (token?.kind === 'num' || token?.kind === 'str') {
            return token.value;
        }
        throw new Error(`Expected an operand in ${expr}`);
    };

    const comparison = (): boolean => {
        const left = operand();
        const op = tokens[pos++];
        if (op?.kind !== 'op') {
            throw new Error(`Expected an operator in ${expr}`);
        }
        if (op.value === '=~' || op.value === '!~') {
            const regex = tokens[pos++];
            if (regex?.kind !== 'regex') {
                throw new Error(`Expected a regex in ${expr}`);
            }
            return regex.regex.test(String(left)) === (op.value === '=~');
        }
        const right = operand();
        switch (op.value) {
            case '==':
                return String(left) === String(right);
            case '!=':
                return String(left) !== String(right);
            // Integer comparisons: ap_expr converts both sides to numbers.
            case '-eq':
                return Number(left) === Number(right);
            case '-ne':
                return Number(left) !== Number(right);
            case '-lt':
                return Number(left) < Number(right);
            case '-le':
                return Number(left) <= Number(right);
            case '-gt':
                return Number(left) > Number(right);
            case '-ge':
                return Number(left) >= Number(right);
            default:
                throw new Error(`Unsupported ap_expr operator ${op.value}`);
        }
    };

    const unary = (): boolean => {
        if (isOp('!')) {
            pos++;
            return !unary();
        }
        if (isOp('(')) {
            pos++;
            const value = or();
            if (!isOp(')')) {
                throw new Error(`Unbalanced parentheses in ${expr}`);
            }
            pos++;
            return value;
        }
        return comparison();
    };

    const and = (): boolean => {
        let value = unary();
        while (isOp('&&')) {
            pos++;
            const right = unary();
            value = value && right;
        }
        return value;
    };

    const or = (): boolean => {
        let value = and();
        while (isOp('||')) {
            pos++;
            const right = and();
            value = value || right;
        }
        return value;
    };

    const result = or();
    if (pos !== tokens.length) {
        throw new Error(`Trailing ap_expr tokens in ${expr}`);
    }
    return result;
}

/**
 * The response headers the .htaccess chain sets, as lower-cased name -> values (one entry per
 * emitted header line, so a duplicate shows up as two values).
 */
export function responseHeaders(files: CompiledHtaccess[], response: ResponseContext): Map<string, string[]> {
    const chain = applicableFiles(files, response.uri);
    const vars = {
        REQUEST_URI: response.uri,
        CONTENT_TYPE: response.contentType ?? '',
        REQUEST_STATUS: String(response.status),
    };
    const onSuccess = response.onSuccess ?? (response.status >= 200 && response.status < 300);
    const tables = { always: new Map<string, string[]>(), onsuccess: new Map<string, string[]>() };
    if (response.varyFromRewrite?.length) {
        tables.onsuccess.set('vary', [response.varyFromRewrite.join(', ')]);
    }

    const apply = (header: HeaderDirective) => {
        if (header.expr && !evaluateExpr(header.expr, vars)) {
            return;
        }
        const table = header.always ? tables.always : tables.onsuccess;
        const existing = table.get(header.name);
        switch (header.action) {
            case 'set':
                table.set(header.name, [header.value!]);
                break;
            case 'add':
                table.set(header.name, [...(existing ?? []), header.value!]);
                break;
            case 'append':
            case 'merge': {
                if (!existing?.length) {
                    table.set(header.name, [header.value!]);
                    break;
                }
                const current = existing[existing.length - 1];
                const parts = current.split(/,\s*/);
                if (header.action === 'merge' && parts.includes(header.value!)) {
                    break;
                }
                table.set(header.name, [...existing.slice(0, -1), `${current}, ${header.value}`]);
                break;
            }
            case 'unset':
                table.delete(header.name);
                break;
        }
    };

    // Plain sections first (parent, then child), then every <If> section (parent's, then child's).
    chain.forEach((file) => file.headers.forEach(apply));
    chain.forEach((file) =>
        file.ifSections.forEach((section) => {
            if (evaluateExpr(section.expr, vars)) {
                section.headers.forEach(apply);
            }
        })
    );

    const result = new Map<string, string[]>();
    const emit = (table: Map<string, string[]>) => {
        for (const [name, values] of table) {
            result.set(name, [...(result.get(name) ?? []), ...values]);
        }
    };
    if (onSuccess) {
        emit(tables.onsuccess);
    }
    emit(tables.always);
    return result;
}

/**
 * The request headers the handler sees once the .htaccess chain's RequestHeader directives have run
 * (parent, then child), as lower-cased name -> one value per header instance. Conditional request
 * handling (If-None-Match against the ETag) happens after this, in the handler.
 */
export function requestHeaders(
    files: CompiledHtaccess[],
    request: { uri: string; headers: Record<string, string | string[]> }
): Map<string, string[]> {
    const result = new Map<string, string[]>();
    for (const [name, value] of Object.entries(request.headers)) {
        result.set(name.toLowerCase(), Array.isArray(value) ? [...value] : [value]);
    }
    for (const file of applicableFiles(files, request.uri)) {
        for (const directive of file.requestHeaders) {
            const values = result.get(directive.name);
            if (values) {
                result.set(
                    directive.name,
                    values.map((value) => editValue(directive, value))
                );
            }
        }
    }
    return result;
}

/**
 * A concrete URL path a mod_alias RedirectMatch pattern matches, so a pattern rule can be probed
 * like an exact one: the first alternative of each group, and a sample segment for each wildcard.
 * Throws if the sample does not actually match, so no pattern is silently left untested.
 */
export function samplePath(pattern: string): string {
    const sample = pattern
        .replace(/^\^/, '')
        .replace(/\$$/, '')
        .replace(/\((?:\?:)?([^()|]+)\|[^()]*\)/g, '$1')
        .replace(/\(\/\.\*\)\?/g, '/sample/')
        .replace(/\(\.\*\)|\.\*|\.\+/g, 'sample')
        .replace(/\[a-z-\]\+/g, 'sample');
    if (!new RegExp(pattern).test(sample)) {
        throw new Error(`Could not synthesise a path for ${pattern} (got ${sample})`);
    }
    return sample;
}
