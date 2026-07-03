importScripts('https://cdn.jsdelivr.net/npm/typescript@5.4.5/lib/typescript.min.js');

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

async function transpile(request, ext) {
    const response = await fetch(request);
    if (!response.ok) return response;

    const source = await response.text();

    const result = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ESNext,
            jsx: ext.endsWith('x') ? ts.JsxEmit.React : undefined,
            experimentalDecorators: ext === 'ts',
            emitDecoratorMetadata: ext === 'ts',
        },
    });

    return new Response(result.outputText, {
        headers: { 'Content-Type': 'application/javascript' },
    });
}

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    const ext = url.pathname
        .match(/\.([a-z0-9]+)$/i)
        ?.at(1)
        ?.toLowerCase();

    if (['jsx', 'ts', 'tsx'].includes(ext)) {
        event.respondWith(transpile(event.request, ext));
    }
});
