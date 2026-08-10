import Markdoc, { type Node } from '@markdoc/markdoc';

/**
 * Serialises a Markdoc document (`.mdoc` source) into clean GitHub-flavoured
 * Markdown for a single framework, resolving `{% if %}` conditionals and
 * `{% $variable %}` / `{% function() %}` interpolations for that framework.
 *
 * Product-agnostic: the caller injects the product's Markdoc config
 * (`functions` + `variables`) and a set of resolver callbacks for the pieces
 * that need product/Astro/filesystem access (example source, API reference
 * tables, partials, link/image URLs). AG Grid wires these up in its docs
 * endpoint; AG Charts / AG Studio can reuse this module unchanged.
 */

export type MarkdownFramework = 'react' | 'angular' | 'vue' | 'javascript';

interface MarkdocFunctionLike {
    // Loose signature so a product's Markdoc `ConfigFunction` map assigns cleanly
    // (its `transform` is optional and takes the full config as the second arg).
    transform?: (parameters: Record<string, any>, context: { variables: Record<string, any> }) => unknown;
}

export interface MarkdocConfigLike {
    functions?: Record<string, MarkdocFunctionLike>;
    variables?: Record<string, any>;
}

/** Source code for an embedded example, resolved for the target framework. */
export interface ExampleSource {
    code: string;
    language: string;
    liveUrl?: string;
}

export interface MarkdownResolvers {
    /** Return the primary source file for an example, transformed for the framework. */
    loadExampleSource?: (params: {
        name: string;
        title?: string;
        framework: MarkdownFramework;
        pageName: string;
    }) => Promise<ExampleSource | null>;
    /** Render an `apiDocumentation` / `interfaceDocumentation` tag as a Markdown table. */
    renderApiTable?: (params: {
        attributes: Record<string, any>;
        framework: MarkdownFramework;
        kind: 'api' | 'interface';
    }) => Promise<string> | string;
    /**
     * Render a product-specific tag (data tables, resource links, content lists) to
     * markdown. Return `null` when the tag is not handled, so the serializer falls
     * back to rendering the tag's children; return a string (possibly empty) when it
     * is handled.
     */
    renderTag?: (params: {
        tag: string;
        attributes: Record<string, any>;
        framework: MarkdownFramework;
        pageName: string;
        /**
         * Render the tag's children to markdown. Content-bearing tags whose attributes carry
         * meaning the children don't (e.g. a card's heading and link) need both halves; the
         * transparent-wrapper fallback only gives the children.
         */
        renderChildren: () => Promise<string>;
    }) => Promise<string | null> | string | null;
    /** Read a `{% partial %}` file's raw Markdoc contents (or null if missing). */
    readPartial?: (params: { file: string; pageName: string }) => string | null;
    /** Transform a `frameworkTransform` code fence into the framework's idiomatic code. */
    transformFence?: (params: { code: string; framework: MarkdownFramework; language: string }) => {
        code: string;
        language: string;
    };
    /** Resolve a link href (framework prefix, version substitution, absolute URL). */
    resolveLinkHref?: (params: { href: string; framework: MarkdownFramework }) => string;
    /**
     * Resolve an image path to a servable URL. May be async — the resolution can go
     * through the product's asset pipeline. Image tags are pre-resolved before
     * rendering (see `prefetchImageSrcs`) so inline images render synchronously.
     */
    resolveImageSrc?: (params: { imagePath: string; pageName: string }) => Promise<string> | string;
}

export interface RenderMarkdocToMarkdownOptions {
    /** Raw Markdoc source (Astro's `page.body` — excludes frontmatter). */
    body: string;
    framework: MarkdownFramework;
    pageName: string;
    /** Pulled from `page.data`; `page.body` does not include frontmatter. */
    frontmatter?: { title?: string; description?: string; enterprise?: boolean };
    /** Current product version, emitted in the frontmatter so it is machine-readable. */
    version?: string;
    /**
     * Per-page Markdoc variables the site injects at render time (e.g. `migrationVersion`
     * from the page frontmatter). Merged over the config variables so functions like
     * `migrationVersion()` resolve exactly as they do on the HTML page.
     */
    variables?: Record<string, unknown>;
    /** The product's Markdoc config, so functions/variables resolve exactly as on the site. */
    markdocConfig: MarkdocConfigLike;
    resolvers?: MarkdownResolvers;
}

interface RenderContext {
    framework: MarkdownFramework;
    pageName: string;
    variables: Record<string, unknown>;
    functions: Record<string, MarkdocFunctionLike>;
    resolvers: MarkdownResolvers;
    /** Image tag `src`s resolved up-front (keyed by page + path), read by the sync renderers. */
    imageSrc: Map<string, string>;
}

export async function renderMarkdocToMarkdown(opts: RenderMarkdocToMarkdownOptions): Promise<string> {
    const { body, framework, pageName, frontmatter = {}, version, variables, markdocConfig, resolvers = {} } = opts;

    const ctx: RenderContext = {
        framework,
        pageName,
        variables: { ...(markdocConfig.variables ?? {}), ...(variables ?? {}), framework },
        functions: markdocConfig.functions ?? {},
        resolvers,
        imageSrc: new Map(),
    };

    const ast = Markdoc.parse(stripSourceHtmlComments(body ?? ''));
    await prefetchImageSrcs(ast.children, ctx);
    const bodyMarkdown = await renderBlocks(ast.children, ctx);

    const frontmatterBlock = buildFrontmatter({
        title: frontmatter.title,
        enterprise: frontmatter.enterprise,
        framework,
        version,
    });
    // Just the H1 — the description is intentionally omitted; the page body is the content.
    const opener = frontmatter.title ? `# ${frontmatter.title}` : '';

    const document = [frontmatterBlock, opener, bodyMarkdown].filter((part) => part && part.length).join('\n\n');

    return normalise(document);
}

function buildFrontmatter({
    title,
    enterprise,
    framework,
    version,
}: {
    title?: string;
    enterprise?: boolean;
    framework: MarkdownFramework;
    version?: string;
}): string {
    const lines = ['---'];
    if (title) {
        lines.push(`title: ${JSON.stringify(title)}`);
    }
    // Only emitted when the page is Enterprise-only, matching the source frontmatter.
    if (enterprise) {
        lines.push('enterprise: true');
    }
    lines.push(`framework: ${framework}`);
    if (version) {
        lines.push(`version: ${JSON.stringify(version)}`);
    }
    lines.push('---');
    return lines.join('\n');
}

function normalise(text: string): string {
    // Collapse runs of blank lines left by dropped tags to a single blank line, but only OUTSIDE
    // fenced code blocks — code (and its blank lines, trailing whitespace and Markdown hard breaks)
    // is preserved verbatim. The opening fence's backtick-run length is tracked so a shorter ``` run
    // inside a longer ```` fence (fencedCodeBlock opens with longest-run + 1) is treated as code, not
    // a delimiter.
    const lines = text.split('\n');
    const out: string[] = [];
    let openFenceLen = 0;
    let blankRun = 0;
    for (let i = 0, len = lines.length; i < len; ++i) {
        const line = lines[i];
        if (openFenceLen === 0) {
            const openMatch = /^\s*(`{3,})/.exec(line);
            if (openMatch) {
                openFenceLen = openMatch[1].length;
                blankRun = 0;
                out.push(line);
                continue;
            }
        } else {
            // Close only on a bare backtick line at least as long as the opening fence.
            const closeMatch = /^\s*(`{3,})\s*$/.exec(line);
            if (closeMatch && closeMatch[1].length >= openFenceLen) {
                openFenceLen = 0;
            }
            out.push(line);
            continue;
        }
        if (line.trim() === '') {
            blankRun++;
            if (blankRun <= 1) {
                out.push('');
            }
        } else {
            blankRun = 0;
            out.push(line);
        }
    }
    return out.join('\n').trimEnd() + '\n';
}

/** Render a list of block-level nodes, separated by a single blank line. */
async function renderBlocks(nodes: Node[], ctx: RenderContext): Promise<string> {
    const parts: string[] = [];
    for (let i = 0, len = nodes.length; i < len; ++i) {
        const node = nodes[i];
        // `else` markers are consumed by their parent `if`; never render standalone.
        if (node.type === 'tag' && node.tag === 'else') {
            continue;
        }
        const rendered = (await renderBlock(node, ctx)).replace(/\s+$/, '');
        if (rendered.trim().length) {
            parts.push(rendered);
        }
    }
    return parts.join('\n\n');
}

async function renderBlock(node: Node, ctx: RenderContext): Promise<string> {
    switch (node.type) {
        case 'document':
            return renderBlocks(node.children, ctx);
        case 'heading': {
            const level = Number(node.attributes.level) || 1;
            return `${'#'.repeat(level)} ${renderInlineChildren(node, ctx).trim()}`;
        }
        case 'paragraph':
        case 'inline':
            // Strip again at the assembled-paragraph level: multi-line HTML comments are split
            // across separate text nodes at each line break, so the per-node strip below never
            // sees a whole `<!-- … -->` and can't remove them.
            return stripHtmlComments(renderInlineChildren(node, ctx)).trim();
        case 'fence':
            return renderFence(node, ctx);
        case 'list':
            return renderList(node, ctx);
        case 'table':
            return renderTable(node, ctx);
        case 'blockquote':
            return renderBlockquote(node, ctx);
        case 'hr':
            return '---';
        case 'tag':
            return renderTagBlock(node, ctx);
        default:
            return node.children ? renderBlocks(node.children, ctx) : '';
    }
}

async function renderTagBlock(node: Node, ctx: RenderContext): Promise<string> {
    const tag = node.tag;

    switch (tag) {
        case 'if':
            return renderBlocks(selectBranch(node, ctx), ctx);
        case 'partial':
            return renderPartial(node, ctx);
        case 'note':
            return renderCallout('Note', node, ctx);
        case 'warning':
            return renderCallout('Warning', node, ctx);
        case 'idea':
            return renderCallout('Tip', node, ctx);
        case 'tabs':
            return renderTabs(node, ctx);
        case 'tabItem':
        case 'flex':
            return renderBlocks(node.children, ctx);
        case 'videoSection':
            return renderVideoSection(node, ctx);
        case 'expandingSection': {
            const header = stringifyAttr(node.attributes.headerText, ctx);
            const inner = await renderBlocks(node.children, ctx);
            // A bold label, not a heading: an expandingSection is a disclosure widget that
            // can appear at any depth, so a fixed heading level would corrupt the document
            // outline. Emphasis carries the title without polluting the heading structure.
            return [header ? `**${header}:**` : '', inner].filter(Boolean).join('\n\n');
        }
        case 'numberHeading':
            return renderNumberHeading(node, ctx);
        case 'image':
            return renderImageTag(node, ctx);
        case 'imageCaption':
            return renderImageCaption(node, ctx);
        case 'gif':
            return renderGif(node, ctx);
        case 'video':
            return renderVideo(node, ctx);
        case 'gridExampleRunner':
        case 'chartExampleRunner':
        case 'studioExampleRunner':
            return renderExample(node, ctx);
        case 'apiDocumentation':
            return renderApi(node, ctx, 'api');
        case 'interfaceDocumentation':
            return renderApi(node, ctx, 'interface');
        case 'kbd':
        case 'br':
        case 'enterpriseIcon':
            return renderTagInline(node, ctx);
        default:
            return renderDelegatedTag(node, ctx);
    }
}

/**
 * A tag with no built-in handler: offer it to the product's `renderTag` resolver
 * (data tables, resource links, content lists). If the resolver declines (returns
 * null), fall back to the transparent-wrapper default of rendering its children.
 */
async function renderDelegatedTag(node: Node, ctx: RenderContext): Promise<string> {
    if (node.tag && ctx.resolvers.renderTag) {
        const rendered = await ctx.resolvers.renderTag({
            tag: node.tag,
            attributes: resolveAttributes(node.attributes ?? {}, ctx),
            framework: ctx.framework,
            pageName: ctx.pageName,
            renderChildren: () => renderBlocks(node.children ?? [], ctx),
        });
        if (rendered != null) {
            return rendered;
        }
    }
    return node.children ? renderBlocks(node.children, ctx) : '';
}

/** Resolve each tag attribute (framework conditionals / variable interpolation) before handing off. */
function resolveAttributes(attrs: Record<string, unknown>, ctx: RenderContext): Record<string, any> {
    const out: Record<string, any> = {};
    const keys = Object.keys(attrs);
    for (let i = 0, len = keys.length; i < len; ++i) {
        out[keys[i]] = resolveValue(attrs[keys[i]], ctx);
    }
    return out;
}

/* -------------------------------------------------------------------------- */
/* Inline rendering                                                            */
/* -------------------------------------------------------------------------- */

function renderInlineChildren(node: Node, ctx: RenderContext): string {
    const children = node.children ?? [];
    let out = '';
    for (let i = 0, len = children.length; i < len; ++i) {
        out += renderInline(children[i], ctx);
    }
    return out;
}

function renderInline(node: Node, ctx: RenderContext): string {
    switch (node.type) {
        case 'inline':
            return renderInlineChildren(node, ctx);
        case 'text':
            // HTML comments (e.g. authoring markers like `<!-- Install React -->`) arrive as
            // literal text; strip them from prose. Code fences are rendered separately and keep
            // their content verbatim, so genuine `<!--` in code examples is untouched.
            return stripHtmlComments(stringifyValue(resolveValue(node.attributes.content, ctx)));
        case 'strong':
            return `**${renderInlineChildren(node, ctx)}**`;
        case 'em':
            return `*${renderInlineChildren(node, ctx)}*`;
        case 's':
            return `~~${renderInlineChildren(node, ctx)}~~`;
        case 'code':
            return inlineCode(stringifyValue(resolveValue(node.attributes.content, ctx)));
        case 'link':
            return renderLink(node, ctx);
        case 'image':
            return renderImageNode(node);
        case 'softbreak':
            return ' ';
        case 'hardbreak':
            return '  \n';
        case 'tag':
            return renderTagInline(node, ctx);
        default:
            return renderInlineChildren(node, ctx);
    }
}

function renderTagInline(node: Node, ctx: RenderContext): string {
    switch (node.tag) {
        case 'kbd':
            return `\`${stringifyAttr(node.attributes.primary, ctx)}\``;
        case 'br':
            return '\n';
        case 'enterpriseIcon':
            return ' (Enterprise)';
        case 'link':
            return renderLink(node, ctx);
        case 'image':
        case 'gif':
            return renderImageTag(node, ctx);
        case 'imageCaption': {
            // Inline (typically a table cell) there is no room for the block layout the
            // block-level renderer uses, so the caption trails the image on one line.
            const caption = renderInlineChildren(node, ctx).trim();
            const image = renderImageTag(node, ctx);
            return caption.length ? `${image} ${caption}` : image;
        }
        case 'if': {
            const branch = selectBranch(node, ctx);
            let out = '';
            for (let i = 0, len = branch.length; i < len; ++i) {
                out += renderInline(branch[i], ctx);
            }
            return out;
        }
        default:
            return renderInlineChildren(node, ctx);
    }
}

function renderLink(node: Node, ctx: RenderContext): string {
    const text = renderInlineChildren(node, ctx);
    const rawHref = String(node.attributes.href ?? '');
    const href = ctx.resolvers.resolveLinkHref
        ? ctx.resolvers.resolveLinkHref({ href: rawHref, framework: ctx.framework })
        : rawHref;
    return `[${text}](${href})`;
}

function renderImageNode(node: Node): string {
    const alt = String(node.attributes.alt ?? '');
    const src = String(node.attributes.src ?? '');
    const title = node.attributes.title ? ` "${node.attributes.title}"` : '';
    return `![${alt}](${src}${title})`;
}

/* -------------------------------------------------------------------------- */
/* Block helpers                                                               */
/* -------------------------------------------------------------------------- */

function renderFence(node: Node, ctx: RenderContext): string {
    // Fence content can contain `{% if isFramework %}` guards; Markdoc parses those as
    // child tag nodes (while `attributes.content` stays the literal string). Render the
    // children as raw code so conditionals/interpolation resolve for this framework —
    // exactly what the site's Snippet component does via its default slot.
    let code = renderFenceCode(node, ctx).replace(/\n$/, '');
    let language = node.attributes.language ? String(node.attributes.language) : '';

    if (node.attributes.frameworkTransform && ctx.resolvers.transformFence) {
        const transformed = ctx.resolvers.transformFence({ code, framework: ctx.framework, language });
        code = transformed.code;
        language = transformed.language || language;
    }

    return fencedCodeBlock(code, language);
}

/**
 * Wrap code in a fenced block whose delimiter is long enough to survive the content.
 * Per CommonMark the fence must be longer than any backtick run inside the code, so we
 * open/close with (longest run + 1), min 3 — otherwise a doc example that itself contains
 * a ``` fence would terminate the block early and corrupt the rest of the page.
 */
export function fencedCodeBlock(code: string, language: string): string {
    let longestRun = 0;
    const matches = code.match(/`+/g);
    if (matches) {
        for (let i = 0, len = matches.length; i < len; ++i) {
            if (matches[i].length > longestRun) {
                longestRun = matches[i].length;
            }
        }
    }
    const fence = '`'.repeat(Math.max(3, longestRun + 1));
    return `${fence}${language}\n${code}\n${fence}`;
}

/**
 * Wrap inline code in a backtick delimiter longer than any run inside the content, padding with a
 * single space when the content starts or ends with a backtick (per CommonMark), so a code span
 * whose text itself contains backticks stays valid Markdown.
 */
function inlineCode(content: string): string {
    let longestRun = 0;
    const matches = content.match(/`+/g);
    if (matches) {
        for (let i = 0, len = matches.length; i < len; ++i) {
            if (matches[i].length > longestRun) {
                longestRun = matches[i].length;
            }
        }
    }
    const fence = '`'.repeat(longestRun + 1);
    const pad = content.startsWith('`') || content.endsWith('`') ? ' ' : '';
    return `${fence}${pad}${content}${pad}${fence}`;
}

/** The fence's code, resolving `{% if %}` guards and interpolation to raw text (no markdown escaping). */
function renderFenceCode(node: Node, ctx: RenderContext): string {
    const children = node.children ?? [];
    if (children.length === 0) {
        return String(node.attributes.content ?? '');
    }
    let out = '';
    for (let i = 0, len = children.length; i < len; ++i) {
        out += renderRawNode(children[i], ctx);
    }
    return out;
}

/** Emit a node subtree as raw text (used inside fenced code, where markdown must not be escaped). */
function renderRawNode(node: Node, ctx: RenderContext): string {
    if (node.type === 'text') {
        return stringifyValue(resolveValue(node.attributes.content, ctx));
    }
    if (node.type === 'tag' && node.tag === 'if') {
        const branch = selectBranch(node, ctx);
        let out = '';
        for (let i = 0, len = branch.length; i < len; ++i) {
            out += renderRawNode(branch[i], ctx);
        }
        return out;
    }
    const children = node.children ?? [];
    if (children.length) {
        let out = '';
        for (let i = 0, len = children.length; i < len; ++i) {
            out += renderRawNode(children[i], ctx);
        }
        return out;
    }
    return stringifyValue(resolveValue(node.attributes?.content, ctx));
}

async function renderList(node: Node, ctx: RenderContext): Promise<string> {
    const ordered = Boolean(node.attributes.ordered);
    const lines: string[] = [];
    const items = node.children ?? [];
    for (let i = 0, len = items.length; i < len; ++i) {
        const marker = ordered ? `${i + 1}. ` : '- ';
        const itemMarkdown = await renderItem(items[i], ctx);
        lines.push(marker + indentContinuation(itemMarkdown, marker.length));
    }
    return lines.join('\n');
}

async function renderItem(item: Node, ctx: RenderContext): Promise<string> {
    const children = item.children ?? [];
    let result = '';
    for (let i = 0, len = children.length; i < len; ++i) {
        const child = children[i];
        const isList = child.type === 'list';
        const rendered =
            child.type === 'inline' ? renderInlineChildren(child, ctx).trim() : await renderBlock(child, ctx);
        if (!rendered.length) {
            continue;
        }
        if (result.length === 0) {
            result = rendered;
        } else if (isList) {
            result += `\n${rendered}`;
        } else {
            result += `\n\n${rendered}`;
        }
    }
    return result;
}

function indentContinuation(text: string, width: number): string {
    const pad = ' '.repeat(width);
    return text
        .split('\n')
        .map((line, index) => (index === 0 || line.length === 0 ? line : pad + line))
        .join('\n');
}

function renderTable(node: Node, ctx: RenderContext): string {
    const thead = (node.children ?? []).find((child) => child.type === 'thead');
    const tbody = (node.children ?? []).find((child) => child.type === 'tbody');

    const headerRow = thead ? (thead.children ?? []).find((child) => child.type === 'tr') : undefined;
    const headerCells = headerRow ? (headerRow.children ?? []) : [];
    if (headerCells.length === 0) {
        return '';
    }

    const aligns = headerCells.map((cell) => cell.attributes?.align as string | undefined);
    const headerTexts = headerCells.map((cell) => renderCell(cell, ctx));
    const separators = aligns.map(alignSeparator);

    const lines = [`| ${headerTexts.join(' | ')} |`, `| ${separators.join(' | ')} |`];

    const bodyRows = tbody ? (tbody.children ?? []).filter((child) => child.type === 'tr') : [];
    for (let i = 0, len = bodyRows.length; i < len; ++i) {
        const cells = (bodyRows[i].children ?? []).map((cell) => renderCell(cell, ctx));
        lines.push(`| ${cells.join(' | ')} |`);
    }

    return lines.join('\n');
}

function alignSeparator(align?: string): string {
    switch (align) {
        case 'center':
            return ':---:';
        case 'right':
            return '---:';
        case 'left':
            return ':---';
        default:
            return '---';
    }
}

function renderCell(cell: Node, ctx: RenderContext): string {
    return renderInlineChildren(cell, ctx).replace(/\|/g, '\\|').replace(/\n/g, ' ').trim();
}

async function renderBlockquote(node: Node, ctx: RenderContext): Promise<string> {
    const inner = await renderBlocks(node.children, ctx);
    return prefixLines(inner, '> ');
}

async function renderCallout(label: string, node: Node, ctx: RenderContext): Promise<string> {
    const inner = (await renderBlocks(node.children, ctx)).trim();
    const combined = inner.length ? `**${label}**\n\n${inner}` : `**${label}**`;
    return prefixLines(combined, '> ');
}

function prefixLines(text: string, prefix: string): string {
    return text
        .split('\n')
        .map((line) => (line.length ? prefix + line : prefix.trimEnd()))
        .join('\n');
}

async function renderTabs(node: Node, ctx: RenderContext): Promise<string> {
    const items = (node.children ?? []).filter((child) => child.type === 'tag' && child.tag === 'tabItem');
    const parts: string[] = [];
    for (let i = 0, len = items.length; i < len; ++i) {
        const item = items[i];
        const label = stringifyAttr(item.attributes.label, ctx) || stringifyAttr(item.attributes.id, ctx);
        const inner = await renderBlocks(item.children, ctx);
        parts.push([label ? `#### ${label}` : '', inner].filter(Boolean).join('\n\n'));
    }
    return parts.join('\n\n');
}

async function renderNumberHeading(node: Node, ctx: RenderContext): Promise<string> {
    const levelText = String(node.attributes.level ?? 'h2');
    const level = Number.parseInt(levelText.replace(/\D/g, ''), 10) || 2;
    const number = stringifyAttr(node.attributes.number, ctx);
    const title = stringifyAttr(node.attributes.title, ctx);
    const prefix = number ? `${number}. ` : '';
    const heading = `${'#'.repeat(level)} ${prefix}${title}`;
    // numberHeading wraps the step's content (code, notes, framework conditionals); render it.
    const inner = (await renderBlocks(node.children ?? [], ctx)).trim();
    return inner.length ? `${heading}\n\n${inner}` : heading;
}

// Tags whose media path is resolved through the product's asset pipeline, and the attribute each
// one carries that path in. `video` belongs here too: Video.astro resolves `videoSrc` via the same
// `getPageImages` lookup the image tags use, so a raw `videoSrc` would not be a servable URL.
const MEDIA_PATH_ATTRIBUTE: Record<string, string> = {
    image: 'imagePath',
    imageCaption: 'imagePath',
    gif: 'imagePath',
    video: 'videoSrc',
};

function imageCacheKey(pageName: string, imagePath: string): string {
    return `${pageName} ${imagePath}`;
}

/**
 * Resolve every image tag's `src` up-front and cache it. Image resolution may be async
 * (the product looks images up through its asset pipeline), but images also appear
 * inline (e.g. inside table cells), where rendering is synchronous. Pre-resolving lets
 * the sync renderers read a ready URL from the cache.
 */
async function prefetchImageSrcs(nodes: Node[], ctx: RenderContext): Promise<void> {
    const resolve = ctx.resolvers.resolveImageSrc;
    if (!resolve) {
        return;
    }
    const pending: Promise<void>[] = [];
    const walk = (list: Node[]): void => {
        for (let i = 0, len = list.length; i < len; ++i) {
            const node = list[i];
            // Only the selected `if` branch is rendered, so only resolve images inside it.
            if (node.type === 'tag' && node.tag === 'if') {
                walk(selectBranch(node, ctx));
                continue;
            }
            const mediaAttribute = node.type === 'tag' && node.tag ? MEDIA_PATH_ATTRIBUTE[node.tag] : undefined;
            const imagePath = mediaAttribute ? stringifyAttr(node.attributes[mediaAttribute], ctx) : '';
            if (imagePath) {
                const pageName = stringifyAttr(node.attributes.pageName, ctx) || ctx.pageName;
                const key = imageCacheKey(pageName, imagePath);
                if (!ctx.imageSrc.has(key)) {
                    ctx.imageSrc.set(key, imagePath);
                    pending.push(
                        Promise.resolve(resolve({ imagePath, pageName }))
                            .then((src) => {
                                if (src) {
                                    ctx.imageSrc.set(key, src);
                                }
                            })
                            // Leave the fallback (raw path) in place if resolution fails.
                            .catch(() => {})
                    );
                }
            }
            if (node.children) {
                walk(node.children);
            }
        }
    };
    walk(nodes);
    await Promise.all(pending);
}

function resolveMediaPath(node: Node, ctx: RenderContext, attribute: string): string {
    const imagePath = stringifyAttr(node.attributes[attribute], ctx);
    if (!ctx.resolvers.resolveImageSrc) {
        return imagePath;
    }
    const pageName = stringifyAttr(node.attributes.pageName, ctx) || ctx.pageName;
    return ctx.imageSrc.get(imageCacheKey(pageName, imagePath)) ?? imagePath;
}

function renderImageTag(node: Node, ctx: RenderContext): string {
    const alt = stringifyAttr(node.attributes.alt, ctx);
    return `![${alt}](${resolveMediaPath(node, ctx, 'imagePath')})`;
}

async function renderImageCaption(node: Node, ctx: RenderContext): Promise<string> {
    const image = renderImageTag(node, ctx);
    const caption = (await renderBlocks(node.children, ctx)).trim();
    return caption.length ? `${image}\n\n${caption}` : image;
}

function renderGif(node: Node, ctx: RenderContext): string {
    const alt = stringifyAttr(node.attributes.alt, ctx);
    return `![${alt}](${resolveMediaPath(node, ctx, 'imagePath')})`;
}

function renderVideo(node: Node, ctx: RenderContext): string {
    const src = resolveMediaPath(node, ctx, 'videoSrc');
    return src ? `[Video](${src})` : '';
}

/**
 * Render a `videoSection` (a YouTube video with optional header prose) as the header
 * prose followed by a link to the video — mirroring the YouTube URL the on-page
 * VideoSection component links to.
 */
async function renderVideoSection(node: Node, ctx: RenderContext): Promise<string> {
    const header = (await renderBlocks(node.children, ctx)).trim();
    const id = stringifyAttr(node.attributes.id, ctx);
    if (!id) {
        return header;
    }
    const title = stringifyAttr(node.attributes.title, ctx) || 'Video';
    const playlist = stringifyAttr(node.attributes.playlist, ctx);
    const url = `https://www.youtube.com/watch?v=${id}${playlist ? `&list=${playlist}` : ''}`;
    const link = `[${title}](${url})`;
    return header.length ? `${header}\n\n${link}` : link;
}

async function renderExample(node: Node, ctx: RenderContext): Promise<string> {
    const title = stringifyAttr(node.attributes.title, ctx);
    const name = stringifyAttr(node.attributes.name, ctx);
    const parts: string[] = [];
    if (title) {
        parts.push(`#### ${title}`);
    }

    if (ctx.resolvers.loadExampleSource) {
        const example = await ctx.resolvers.loadExampleSource({
            name,
            title,
            framework: ctx.framework,
            pageName: ctx.pageName,
        });
        if (example && example.code) {
            parts.push(fencedCodeBlock(example.code.replace(/\n$/, ''), example.language || ''));
        }
        if (example && example.liveUrl) {
            parts.push(`[Live example: ${title || name}](${example.liveUrl})`);
        }
    }

    return parts.join('\n\n');
}

async function renderApi(node: Node, ctx: RenderContext, kind: 'api' | 'interface'): Promise<string> {
    if (!ctx.resolvers.renderApiTable) {
        return '';
    }
    const output = await ctx.resolvers.renderApiTable({
        // Resolve variable/function attributes (e.g. `source=$foo`) before handing off,
        // matching `renderDelegatedTag` — the resolver expects plain values, not AST nodes.
        attributes: resolveAttributes(node.attributes ?? {}, ctx),
        framework: ctx.framework,
        kind,
    });
    return output ?? '';
}

async function renderPartial(node: Node, ctx: RenderContext): Promise<string> {
    if (!ctx.resolvers.readPartial) {
        return '';
    }
    const file = stringifyAttr(node.attributes.file, ctx);
    const contents = ctx.resolvers.readPartial({ file, pageName: ctx.pageName });
    if (!contents) {
        return '';
    }
    const partialAst = Markdoc.parse(contents);
    // The partial is a separate AST, so its image tags weren't seen by the top-level
    // prefetch pass — resolve their `src`s into the shared cache before rendering.
    await prefetchImageSrcs(partialAst.children, ctx);
    return renderBlocks(partialAst.children, ctx);
}

/* -------------------------------------------------------------------------- */
/* Conditionals + expression evaluation                                        */
/* -------------------------------------------------------------------------- */

interface Branch {
    condition: unknown;
    nodes: Node[];
}

/**
 * Split an `if` node's children into condition branches (on `else` markers) and
 * return the nodes of the first branch whose condition resolves truthy. A
 * plain `{% else /%}` (no condition) acts as the default branch.
 */
function selectBranch(node: Node, ctx: RenderContext): Node[] {
    const branches: Branch[] = [];
    let current: Branch = { condition: node.attributes?.primary, nodes: [] };

    const children = node.children ?? [];
    for (let i = 0, len = children.length; i < len; ++i) {
        const child = children[i];
        if (child.type === 'tag' && child.tag === 'else') {
            branches.push(current);
            current = { condition: child.attributes?.primary, nodes: [] };
        } else {
            current.nodes.push(child);
        }
    }
    branches.push(current);

    for (let i = 0, len = branches.length; i < len; ++i) {
        const { condition, nodes } = branches[i];
        const truthy = condition === undefined ? true : Boolean(resolveValue(condition, ctx));
        if (truthy) {
            return nodes;
        }
    }
    return [];
}

/** Resolve a Markdoc AST value (literal, Variable or Function) for the framework. */
function resolveValue(value: any, ctx: RenderContext): unknown {
    if (value === null || value === undefined || typeof value !== 'object') {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((entry) => resolveValue(entry, ctx));
    }

    switch (value.$$mdtype) {
        case 'Variable':
            return getPath(ctx.variables, value.path ?? []);
        case 'Function': {
            const fn = ctx.functions[value.name];
            if (!fn || typeof fn.transform !== 'function') {
                return '';
            }
            const params: Record<string, unknown> = {};
            const rawParams = value.parameters ?? {};
            const keys = Object.keys(rawParams);
            for (let i = 0, len = keys.length; i < len; ++i) {
                params[keys[i]] = resolveValue(rawParams[keys[i]], ctx);
            }
            return fn.transform(params, { variables: ctx.variables });
        }
        default:
            return value;
    }
}

function getPath(source: Record<string, unknown>, pathParts: (string | number)[]): unknown {
    let current: any = source;
    for (let i = 0, len = pathParts.length; i < len; ++i) {
        if (current === null || current === undefined) {
            return undefined;
        }
        current = current[pathParts[i]];
    }
    return current;
}

function stringifyAttr(attr: unknown, ctx: RenderContext): string {
    return stringifyValue(resolveValue(attr, ctx));
}

function stringifyValue(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return '';
}

/** Remove HTML comments (`<!-- … -->`, including multi-line) from prose text. */
function stripHtmlComments(text: string): string {
    return text.replace(/<!--[\s\S]*?-->/g, '');
}

/**
 * Strip block-level HTML comments from the raw Markdoc source before parsing. A comment whose `<!--`
 * opens a line (the migration-template scaffolding) is authoring-only and must not render — and when
 * it contains blank lines Markdoc splits it across sibling blocks, so the `<!--`/`-->` markers land in
 * different nodes than the render-time strip can pair up and leak (along with any `{% %}` tags nested
 * inside). Removing them here also stops those nested tags from being executed. Comments inside fenced
 * code blocks are legitimate example content and are preserved; inline comments within prose are left
 * to the render-time strip.
 */
function stripSourceHtmlComments(body: string): string {
    const lines = body.split('\n');
    const out: string[] = [];
    let openFenceLen = 0;
    let inComment = false;
    for (let i = 0, len = lines.length; i < len; ++i) {
        const line = lines[i];
        if (inComment) {
            const end = line.indexOf('-->');
            if (end !== -1) {
                inComment = false;
                const rest = line.slice(end + 3);
                if (rest.trim().length) {
                    out.push(rest);
                }
            }
            continue;
        }
        if (openFenceLen === 0) {
            const open = /^\s*(`{3,})/.exec(line);
            if (open) {
                openFenceLen = open[1].length;
                out.push(line);
                continue;
            }
            if (/^\s*<!--/.test(line)) {
                let stripped = line.replace(/<!--[\s\S]*?-->/g, '');
                if (stripped.includes('<!--')) {
                    inComment = true;
                    stripped = stripped.slice(0, stripped.indexOf('<!--'));
                }
                if (stripped.trim().length) {
                    out.push(stripped);
                }
                continue;
            }
            out.push(line);
        } else {
            const close = /^\s*(`{3,})\s*$/.exec(line);
            if (close && close[1].length >= openFenceLen) {
                openFenceLen = 0;
            }
            out.push(line);
        }
    }
    return out.join('\n');
}
