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

        it('a 410 Redirect returns Gone', () => {
            const file = compileHtaccess('Redirect 410 /gone\nRedirectMatch 410 "^/gone-too/.+"');
            expect(route([file], { url: 'https://h.example/gone' })).toMatchObject({ type: 'status', status: 410 });
            expect(route([file], { url: 'https://h.example/gone-too/x' })).toMatchObject({ status: 410 });
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
            expect(() => evaluateExpr('-f %{REQUEST_FILENAME}', vars)).toThrow(/syntax/);
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

        it('sends onsuccess headers only for 2xx (or an ErrorDocument), and `always` headers for every status', () => {
            const file = compileHtaccess('Header set X-Success "1"\nHeader always set X-Always "1"');
            expect([...responseHeaders([file], { uri: '/', status: 301 }).keys()]).toEqual(['x-always']);
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
