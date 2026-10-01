import {
    compileHtaccess,
    evaluateExpr,
    followRedirects,
    requestHeaders,
    responseHeaders,
    route,
    samplePath,
    tokenize,
} from './htaccessSimulator';

// The simulator is what the htaccess behaviour tests trust, so its Apache semantics are pinned
// here against small hand-written files rather than inferred from the generated output.
describe('htaccessSimulator', () => {
    describe('tokenize', () => {
        it('groups quoted arguments, keeps escaped spaces and drops only the escaped quote', () => {
            expect(tokenize('Header set Link "a \\"b\\" c" "expr=%{X} =~ m#\\.#"')).toEqual([
                'Header',
                'set',
                'Link',
                'a "b" c',
                'expr=%{X} =~ m#\\.#',
            ]);
            expect(tokenize('RewriteCond %{REQUEST_URI} !^/a(?:\\ Comodo\\ DCV)?$')).toEqual([
                'RewriteCond',
                '%{REQUEST_URI}',
                '!^/a(?:\\ Comodo\\ DCV)?$',
            ]);
        });

        it('groups single-quoted arguments too, so a double quote can sit inside one', () => {
            expect(tokenize(`RequestHeader edit* If-None-Match '-gzip"' '"'`)).toEqual([
                'RequestHeader',
                'edit*',
                'If-None-Match',
                '-gzip"',
                '"',
            ]);
        });
    });

    describe('directives', () => {
        it('throws on a directive it neither models nor deliberately ignores, typos included', () => {
            for (const line of [
                'RewriteEngin On',
                'Headr set X-A "1"',
                'RewriteBase /',
                '<Files "a.html">',
                'ExpiresActive On',
            ]) {
                expect(() => compileHtaccess(line), line).toThrow(/Unsupported directive/);
            }
            // Only AllowNoSlash is modelled; Inherit would change which rewrite block applies.
            expect(() => compileHtaccess('RewriteOptions Inherit')).toThrow(/Unsupported RewriteOptions/);
            // Inside an <If>, mod_alias takes only the expression form.
            expect(() => compileHtaccess('<If "-d \'/a\'">\nRedirect 301 /a /b\n</If>')).toThrow(/inside <If>/);
        });

        it('skips only the directives it ignores on purpose', () => {
            const compiled = compileHtaccess(`<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html
</IfModule>
AddType text/markdown md
AddCharset utf-8 .md
Options -Indexes`);
            expect(compiled).toMatchObject({ rewriteRules: [], aliases: [], headers: [], hasRewrite: false });
        });

        it('throws on a rule or condition flag, or a RewriteEngine form, it does not model', () => {
            expect(() => compileHtaccess('RewriteRule ^(.*)$ /x/$1 [R=301,B,L]')).toThrow(/Unsupported flag \[B\]/);
            expect(() => compileHtaccess('RewriteRule ^(.*)$ /x/ [R=301,QSA,L]')).toThrow(/Unsupported flag \[QSA\]/);
            expect(() => compileHtaccess('RewriteCond %{HTTP_HOST} x [NV]\nRewriteRule ^ - [L]')).toThrow(
                /Unsupported flag \[NV\]/
            );
            expect(() => compileHtaccess('RewriteEngine Off')).toThrow(/Unsupported RewriteEngine/);
        });
    });

    describe('mod_rewrite', () => {
        const at = (path: string, host = 'www.example.com') => `https://${host}${path}`;

        it('matches the pattern against the path below the .htaccess directory, and %{REQUEST_URI} against the full path', () => {
            const child = compileHtaccess(
                `RewriteEngine On
RewriteRule ^old/(.*)$ /archive/1.0/new/$1 [R=301,L]
RewriteCond %{REQUEST_URI} ^/archive/1\\.0/full$
RewriteRule ^ /archive/1.0/seen-full/ [R=301,L]`,
                '/archive/1.0/'
            );
            expect(route([child], { url: at('/archive/1.0/old/x/') })).toMatchObject({
                type: 'redirect',
                location: 'https://www.example.com/archive/1.0/new/x/',
            });
            expect(route([child], { url: at('/archive/1.0/full') })).toMatchObject({
                location: 'https://www.example.com/archive/1.0/seen-full/',
            });
        });

        it("uses only the deepest file's rewrite rules: a child block replaces its parent's", () => {
            const root = compileHtaccess('RewriteEngine On\nRewriteRule ^(.*)$ https://other.example/$1 [R=301,L]');
            const child = compileHtaccess('RewriteEngine On\nRewriteRule ^nothing$ - [L]', '/sub/');
            expect(route([root, child], { url: at('/sub/page/') })).toMatchObject({ type: 'serve' });
            expect(route([root, child], { url: at('/elsewhere/') })).toMatchObject({ type: 'redirect' });
        });

        it('treats consecutive [OR] conditions as one group, honours [NC] and negation', () => {
            const file = compileHtaccess(`RewriteCond %{HTTP_HOST} ^a\\.example$ [NC,OR]
RewriteCond %{HTTP_HOST} ^b\\.example$
RewriteCond %{REQUEST_URI} !^/keep/
RewriteRule ^(.*)$ https://www.example.com/$1 [R=301,L]`);
            expect(route([file], { url: 'https://A.EXAMPLE/x/' })).toMatchObject({ type: 'redirect' });
            expect(route([file], { url: 'https://b.example/x/' })).toMatchObject({ type: 'redirect' });
            expect(route([file], { url: 'https://c.example/x/' })).toMatchObject({ type: 'serve' });
            expect(route([file], { url: 'https://a.example/keep/x/' })).toMatchObject({ type: 'serve' });
        });

        it('[S=n] skips exactly the next n rules', () => {
            const file = compileHtaccess(`RewriteCond %{HTTP_HOST} !^www\\.
RewriteRule ^ - [S=1]
RewriteRule ^one$ /first/ [R=301,L]
RewriteRule ^(one|two)$ /second/ [R=301,L]`);
            expect(route([file], { url: at('/one') })).toMatchObject({ location: 'https://www.example.com/first/' });
            expect(route([file], { url: at('/one', 'skip.example.com') })).toMatchObject({
                location: 'https://skip.example.com/second/',
            });
        });

        it('escapes # without [NE] and keeps it with [NE], and appends the inbound query string', () => {
            const file = compileHtaccess(`RewriteRule ^a$ /t/#frag [R=301,L]
RewriteRule ^b$ /t/#frag [R=301,NE,L]`);
            expect(route([file], { url: at('/a?q=1') })).toMatchObject({
                location: 'https://www.example.com/t/%23frag?q=1',
            });
            expect(route([file], { url: at('/b') })).toMatchObject({ location: 'https://www.example.com/t/#frag' });
        });

        // Each expectation below is what Apache 2.4.67 answered for the same rule and request.
        describe('URL escaping', () => {
            const file = compileHtaccess(`RewriteRule ^r/(.*)$ https://www.example.com/$1 [R=301,L]
RewriteRule ^ne/(.*)$ https://www.example.com/$1 [R=301,NE,L]
RewriteRule ^u/ https://www.example.com%{REQUEST_URI} [R=301,L]
RewriteRule ^rel/(.*)$ /target/$1 [R=301,L]
RewriteRule ^ir/(.*)$ /t/$1 [L]
RewriteRule ^lit$ /t/a\\ b#frag&x [R=301,L]
RewriteRule ^qs/(.*)$ /t/$1?added=1 [R=301,L]
RewriteRule ^qsp/ /t/?x=a\\ b [R=301,L]
RewriteRule ^le/(.*)$ /t/$1? [R=301,L]`);
            const location = (path: string) => {
                const outcome = route([file], { url: `http://h.example${path}` });
                return outcome.type === 'redirect' ? outcome.location : 'status' in outcome ? outcome.status : outcome;
            };

            it.each([
                ['/r/some%20page/', 'https://www.example.com/some%20page/'],
                ['/r/caf%C3%A9/', 'https://www.example.com/caf%c3%a9/'],
                ['/r/café/', 'https://www.example.com/caf%c3%a9/'],
                ['/r/a%23b/', 'https://www.example.com/a%23b/'],
                ['/r/a&b/', 'https://www.example.com/a&b/'],
                ['/r/a%26b/', 'https://www.example.com/a&b/'],
                ['/r/a%7e%41/', 'https://www.example.com/a~A/'],
                ["/r/a+b%25c~d'e(f)/", "https://www.example.com/a+b%25c~d'e(f)/"],
                [
                    '/r/a%22c%3Cd%7Bi%7Cj%60k%5El%5Bm%5Co;p:q@r=s,t!u*v$w/',
                    'https://www.example.com/a%22c%3cd%7bi%7cj%60k%5el%5bm%5co;p:q@r=s,t!u*v$w/',
                ],
                ['/r/x/?q=a%20b&c=%3F', 'https://www.example.com/x/?q=a%20b&c=%3F'],
                ['/u/some%20page/', 'https://www.example.com/u/some%20page/'],
                ['/rel/some%20page/', 'http://h.example/target/some%20page/'],
                ['/lit', 'http://h.example/t/a%20b%23frag&x'],
            ])('re-escapes the path of an external redirect without [NE]: %s', (path, expected) => {
                expect(location(path)).toBe(expected);
            });

            it.each([
                ['/ne/some%20page/', 'https://www.example.com/some page/'],
                ['/ne/caf%C3%A9/', 'https://www.example.com/café/'],
                ['/ne/a%23b/', 'https://www.example.com/a#b/'],
                ['/ne/a%25c/', 'https://www.example.com/a%c/'],
            ])('sends the decoded bytes with [NE]: %s', (path, expected) => {
                expect(location(path)).toBe(expected);
            });

            it("replaces the request's query with the substitution's, escaping only a query the rule wrote", () => {
                expect(location('/qs/x%20y/?orig=1')).toBe('http://h.example/t/x%20y/?added=1');
                expect(location('/qsp/?o=1')).toBe('http://h.example/t/?x=a%20b');
                expect(location('/le/x/?orig=1')).toBe('http://h.example/t/x/');
            });

            it('refuses a %3F that a back-reference or variable carries into a substitution, but not a literal ?', () => {
                expect(location('/r/a%3Fb/')).toBe(403);
                expect(location('/u/a%3Fb/')).toBe(403);
                expect(location('/qs/a%3Fb/')).toBe(403);
                expect(route([file], { url: 'http://h.example/ir/a%3Fb' })).toMatchObject({
                    type: 'status',
                    status: 403,
                });
                expect(location('/qsp/a%3Fb')).toBe('http://h.example/t/?x=a%20b');
            });

            it('answers a malformed escape with 400 and %00 with 404, and refuses to guess at an encoded slash', () => {
                expect(location('/r/a%zzb/')).toBe(400);
                expect(location('/r/a%00b/')).toBe(404);
                expect(() => location('/r/a%2Fb/')).toThrow(/AllowEncodedSlashes/);
            });

            it('matches rules against the decoded path and serves it decoded', () => {
                const page = compileHtaccess('RewriteRule ^page/$ /moved/ [R=301,L]');
                expect(route([page], { url: 'http://h.example/p%61ge/' })).toMatchObject({
                    location: 'http://h.example/moved/',
                });
                expect(route([page], { url: 'http://h.example/caf%C3%A9/' })).toMatchObject({
                    type: 'serve',
                    path: '/café/',
                });
            });
        });

        it('returns 410 for [G] and for R=410, and re-runs an internal rewrite as a new request', () => {
            const file = compileHtaccess(`RewriteRule ^gone$ - [G]
RewriteRule ^also-gone$ - [R=410,L]
RewriteCond %{HTTP_ACCEPT} text/markdown
RewriteCond %{REQUEST_URI} ^/(page)/?$
RewriteCond %{DOCUMENT_ROOT}/%1.md -f
RewriteRule ^ /%1.md [L]`);
            expect(route([file], { url: at('/gone') })).toMatchObject({ type: 'status', status: 410 });
            expect(route([file], { url: at('/also-gone') })).toMatchObject({ type: 'status', status: 410 });
            const exists = (path: string) => path === '/page.md';
            expect(route([file], { url: at('/page/'), accept: 'text/markdown', fileExists: exists })).toEqual({
                type: 'serve',
                path: '/page.md',
                query: '',
                vary: ['Accept'],
            });
            // No twin on disk, or a browser Accept: served as-is and mod_rewrite adds no Vary.
            expect(route([file], { url: at('/page/'), accept: 'text/markdown' })).toMatchObject({ vary: [] });
            expect(route([file], { url: at('/page/'), fileExists: exists })).toMatchObject({ path: '/page/' });
        });
    });

    describe('mod_alias', () => {
        it('Redirect matches whole path segments and appends the remainder and query', () => {
            const file = compileHtaccess('Redirect 301 /old /new\nRedirect 301 /dir/ /target/');
            expect(route([file], { url: 'https://h.example/old/x?y=1' })).toMatchObject({
                location: 'https://h.example/new/x?y=1',
            });
            expect(route([file], { url: 'https://h.example/older' })).toMatchObject({ type: 'serve' });
            expect(route([file], { url: 'https://h.example/dir/deep/' })).toMatchObject({
                location: 'https://h.example/target/deep/',
            });
        });

        it("first match wins, with the child's directives ahead of the parent's, after mod_rewrite", () => {
            const root = compileHtaccess('Redirect 301 /a/ /from-root/\nRedirectMatch 410 "^/a/b/$"');
            const child = compileHtaccess('Redirect 301 /a/b/ /from-child/', '/a/');
            expect(route([root, child], { url: 'https://h.example/a/b/' })).toMatchObject({
                location: 'https://h.example/from-child/',
            });
            expect(route([root], { url: 'https://h.example/a/b/' })).toMatchObject({
                location: 'https://h.example/from-root/b/',
            });
            const rewriteFirst = compileHtaccess('RewriteRule ^a/$ /rewritten/ [R=301,L]\nRedirect 301 /a/ /aliased/');
            expect(route([rewriteFirst], { url: 'https://h.example/a/' })).toMatchObject({
                location: 'https://h.example/rewritten/',
            });
        });

        it("escapes a Redirect's appended remainder, and a RedirectMatch target's path but not its query or fragment", () => {
            // As Apache 2.4.67 answered.
            const file = compileHtaccess('Redirect 301 /al /dest\nRedirectMatch 301 ^/am/(.*)$ /dest/$1');
            const at = (path: string) =>
                (route([file], { url: `http://h.example${path}` }) as { location: string }).location;
            expect(at('/al/some%20page/')).toBe('http://h.example/dest/some%20page/');
            expect(at('/al/caf%C3%A9/')).toBe('http://h.example/dest/caf%c3%a9/');
            expect(at('/al/a%3Fb/?x=1')).toBe('http://h.example/dest/a%3fb/?x=1');
            expect(at('/al/a%23b/')).toBe('http://h.example/dest/a%23b/');
            expect(at('/am/some%20page/')).toBe('http://h.example/dest/some%20page/');
            expect(at('/am/a%3Fb/')).toBe('http://h.example/dest/a?b/');
            expect(at('/am/a%23b/')).toBe('http://h.example/dest/a#b/');
            expect(at('/am/a%26b/?x=1')).toBe('http://h.example/dest/a&b/?x=1');
        });

        it('a 410 Redirect returns Gone', () => {
            const file = compileHtaccess('Redirect 410 /gone\nRedirectMatch 410 "^/gone-too/.+"');
            expect(route([file], { url: 'https://h.example/gone' })).toMatchObject({ type: 'status', status: 410 });
            expect(route([file], { url: 'https://h.example/gone-too/x' })).toMatchObject({ status: 410 });
        });

        it("tries an <If>'s expression Redirect before the Redirect lists, inherited by a child", () => {
            const root = compileHtaccess(`<If "%{HTTP_HOST} == 'alias.example' && -d '%{DOCUMENT_ROOT}%{REQUEST_URI}'">
    Redirect 301 "https://www.example%{REQUEST_URI}/"
</If>`);
            const child = compileHtaccess('Redirect 301 /sub /listed', '/sub/');
            const dirExists = (path: string) => path === '/sub';
            expect(route([root, child], { url: 'https://alias.example/sub?q=1', dirExists })).toMatchObject({
                type: 'redirect',
                status: 301,
                location: 'https://www.example/sub/?q=1',
            });
            // A false expression leaves the lists to answer.
            expect(route([root, child], { url: 'https://www.example/sub', dirExists })).toMatchObject({
                location: 'https://www.example/listed',
            });
            expect(route([root, child], { url: 'https://alias.example/sub' })).toMatchObject({
                location: 'https://alias.example/listed',
            });
        });
    });

    describe("mod_rewrite and the .htaccess's own directory", () => {
        const rules = 'RewriteEngine On\nRewriteRule ^ https://www.example%{REQUEST_URI} [R=301,L]';

        it('skips the rules for that directory without its slash, leaving it to mod_dir', () => {
            const child = compileHtaccess(rules, '/sub/');
            expect(route([child], { url: 'https://h.example/sub' })).toMatchObject({ type: 'serve' });
            expect(route([child], { url: 'https://h.example/sub/' })).toMatchObject({
                location: 'https://www.example/sub/',
            });
            expect(route([child], { url: 'https://h.example/sub/page' })).toMatchObject({
                location: 'https://www.example/sub/page',
            });
        });

        it('runs them with RewriteOptions AllowNoSlash, or when the rules are in a parent directory', () => {
            const allowing = compileHtaccess(`RewriteOptions AllowNoSlash\n${rules}`, '/sub/');
            expect(route([allowing], { url: 'https://h.example/sub' })).toMatchObject({
                location: 'https://www.example/sub',
            });
            const root = compileHtaccess(rules);
            expect(route([root], { url: 'https://h.example/sub' })).toMatchObject({
                location: 'https://www.example/sub',
            });
        });
    });

    describe('samplePath', () => {
        it('produces a path each RedirectMatch pattern shape matches, and refuses one it cannot', () => {
            for (const pattern of ['^/forum/.+', '^/a(/.*)?', '^/(react|vue)/(.*)', '^/x-(b|c)-[a-z-]+$', '^/d/$']) {
                expect(new RegExp(pattern).test(samplePath(pattern)), pattern).toBe(true);
            }
            expect(() => samplePath('^/[0-9]{4}/$')).toThrow(/Could not synthesise/);
        });
    });

    describe('followRedirects', () => {
        it('follows to the final response, stops at URLs another server handles, and throws on a loop', () => {
            const file = compileHtaccess(
                'Redirect 301 /a /b\nRedirect 301 /b /c\nRedirect 301 /x /y\nRedirect 301 /y /x'
            );
            const chain = followRedirects([file], { url: 'https://h.example/a' });
            expect(chain.hops.map((hop) => hop.location)).toEqual(['https://h.example/b', 'https://h.example/c']);
            expect(chain.final).toMatchObject({ url: 'https://h.example/c', outcome: { type: 'serve' } });
            const proxied = followRedirects([file], { url: 'https://h.example/a' }, (url) => url.pathname !== '/b');
            expect(proxied.final).toEqual({ url: 'https://h.example/b', outcome: null });
            expect(() => followRedirects([file], { url: 'https://h.example/x' })).toThrow(/loop/);
        });
    });

    describe('ap_expr', () => {
        const vars = { REQUEST_URI: '/a/b.html', CONTENT_TYPE: 'text/html; charset=utf-8', REQUEST_STATUS: '404' };

        it('evaluates regex matches, comparisons, negation, grouping and precedence', () => {
            expect(evaluateExpr('%{REQUEST_URI} =~ m#^/a/#', vars)).toBe(true);
            expect(evaluateExpr('%{REQUEST_URI} !~ m#^/a/#', vars)).toBe(false);
            expect(evaluateExpr('%{REQUEST_STATUS} == 200 && %{CONTENT_TYPE} =~ m#^text/html#', vars)).toBe(false);
            expect(evaluateExpr("%{REQUEST_STATUS} != '200'", vars)).toBe(true);
            expect(evaluateExpr('%{CONTENT_TYPE} =~ m#^text/html# && !( %{REQUEST_URI} =~ m#^/a/# )', vars)).toBe(
                false
            );
            expect(evaluateExpr('%{REQUEST_URI} =~ m#^/x# || %{REQUEST_URI} =~ m#\\.html$#', vars)).toBe(true);
        });

        it('throws on variables or syntax it does not model, rather than guessing', () => {
            expect(() => evaluateExpr('%{HTTP_USER_AGENT} =~ m#x#', vars)).toThrow(/variable/);
            expect(() => evaluateExpr("-s '/a'", vars)).toThrow(/syntax/);
            // A file test needs a filesystem: header conditions have none.
            expect(() => evaluateExpr("-d '/a'", vars)).toThrow(/file test/);
        });

        it('interpolates variables in quoted strings and runs file tests through the caller', () => {
            const seen: string[] = [];
            const dirs = (op: string, path: string) => {
                seen.push(`${op} ${path}`);
                return path === '/a/b.html';
            };
            expect(evaluateExpr("'%{REQUEST_URI}:%{REQUEST_STATUS}' == '/a/b.html:404'", vars)).toBe(true);
            expect(evaluateExpr("-d '%{REQUEST_URI}' && !-d '/x'", vars, dirs)).toBe(true);
            expect(seen).toEqual(['-d /a/b.html', '-d /x']);
        });
    });

    describe('mod_headers', () => {
        it('applies the parent before the child, and every <If> after every plain section', () => {
            const root = compileHtaccess(`Header set X-Order "root"
<If "%{REQUEST_URI} =~ m#^/sub/#">
    Header set X-Order "root-if"
</If>
Header set X-Plain "root"`);
            const child = compileHtaccess('Header set X-Order "child"\nHeader set X-Plain "child"', '/sub/');
            const headers = responseHeaders([root, child], { uri: '/sub/page.html', status: 200 });
            expect(headers.get('x-order')).toEqual(['root-if']);
            expect(headers.get('x-plain')).toEqual(['child']);
        });

        it('sends onsuccess headers for 2xx, a static-file 304 (or an ErrorDocument), and `always` headers for every status', () => {
            const file = compileHtaccess('Header set X-Success "1"\nHeader always set X-Always "1"');
            expect([...responseHeaders([file], { uri: '/', status: 301 }).keys()]).toEqual(['x-always']);
            // Apache 2.4.52 (production) sends the normal table with a static-file revalidation.
            expect([...responseHeaders([file], { uri: '/a.css', status: 304 }).keys()]).toEqual([
                'x-success',
                'x-always',
            ]);
            expect([...responseHeaders([file], { uri: '/404.html', status: 404, onSuccess: true }).keys()]).toEqual([
                'x-success',
                'x-always',
            ]);
        });

        it('evaluates expr= conditions, and append/unset/add semantics', () => {
            const file = compileHtaccess(`Header set Cache-Control "long" "expr=%{REQUEST_URI} =~ m#\\.js$#"
Header append Vary Accept
Header append Vary Origin
Header add X-Dup "a"
Header add X-Dup "b"
Header always set X-Gone "1"
Header always unset X-Gone`);
            const js = responseHeaders([file], { uri: '/a.js', status: 200, varyFromRewrite: ['Accept-Language'] });
            expect(js.get('cache-control')).toEqual(['long']);
            expect(js.get('vary')).toEqual(['Accept-Language, Accept, Origin']);
            expect(js.get('x-dup')).toEqual(['a', 'b']);
            expect(js.has('x-gone')).toBe(false);
            expect(responseHeaders([file], { uri: '/a.html', status: 200 }).has('cache-control')).toBe(false);
        });

        it('RequestHeader edit replaces the first match per header instance, edit* every match, parent then child', () => {
            const root = compileHtaccess(
                `RequestHeader edit* X-List '-x"' '"'\nRequestHeader edit X-One "a(b)" "[$1&]"`
            );
            const child = compileHtaccess(`RequestHeader edit X-List '^"' "'"`, '/sub/');
            const headers = requestHeaders([root, child], {
                uri: '/sub/page.html',
                headers: { 'X-List': ['"1-x", "2-x"', '"3-x"'], 'X-One': 'abab', 'X-Other': '"4-x"' },
            });
            expect(headers.get('x-list')).toEqual([`'1", "2"`, `'3"`]);
            expect(headers.get('x-one')).toEqual(['[bab]ab']);
            expect(headers.get('x-other')).toEqual(['"4-x"']);
            expect(
                requestHeaders([root, child], { uri: '/page.html', headers: { 'X-List': '"1-x"' } }).get('x-list')
            ).toEqual(['"1"']);
        });

        it('throws on a RequestHeader form it does not model', () => {
            expect(() => compileHtaccess('RequestHeader set X-A "1"')).toThrow(/Unsupported RequestHeader/);
            expect(() => compileHtaccess('RequestHeader edit X-A "a" "b" "expr=true"')).toThrow(
                /Unsupported RequestHeader/
            );
        });
    });
});
