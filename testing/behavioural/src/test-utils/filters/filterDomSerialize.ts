/**
 * Pure DOM → text serialisers for filter panels, used by FilterDom. Each produces a terse, diff-friendly
 * diagram of what the panel shows; only the DOM is read. The applied model is appended by FilterDom, not here.
 */

function text(el: Element | null | undefined): string {
    return el?.textContent?.trim() ?? '';
}

function isVisible(el: Element | null | undefined): boolean {
    return !!el && !el.classList.contains('ag-hidden') && !el.classList.contains('ag-invisible');
}

function visibleInputs(root: ParentNode): HTMLInputElement[] {
    // A hidden input (e.g. the date filter's `.ag-filter-to` wrapper) can carry `ag-hidden` on an
    // ancestor rather than the `.ag-input-field` itself, so check the whole ancestry.
    return Array.from(root.querySelectorAll<HTMLInputElement>('.ag-input-field input')).filter(
        (input) => input.type !== 'checkbox' && input.type !== 'radio' && !input.closest('.ag-hidden')
    );
}

/** `Apply ⊘ | Clear | Reset` for the buttons under `scope` (⊘ marks disabled), or '' when none. */
function buttonsLine(buttons: HTMLButtonElement[]): string {
    if (!buttons.length) {
        return '';
    }
    const parts = buttons.map((b) => `${text(b)}${b.disabled ? ' ⊘' : ''}`);
    return `buttons: ${parts.join(' | ')}`;
}

/** Tree-list indentation depth of a set-filter item (0 for a flat list) from its `ag-set-filter-indent-N` class. */
export function setItemDepth(item: Element): number {
    for (const cls of item.classList) {
        if (cls.startsWith('ag-set-filter-indent-')) {
            return Number(cls.slice('ag-set-filter-indent-'.length)) || 0;
        }
    }
    return 0;
}

/** Appends a set filter's mini-filter line (unless hidden) and its checkbox items, scoped to `scope`. */
function serializeSetBody(scope: ParentNode, lines: string[]): void {
    const mini = scope.querySelector<HTMLInputElement>('.ag-mini-filter input[type="text"]');
    // Omit the line when the mini-filter is suppressed/hidden (its wrapper carries `ag-hidden`).
    if (mini && !mini.closest('.ag-hidden')) {
        lines.push(`mini-filter: "${mini.value}"`);
    }
    scope.querySelectorAll('.ag-set-filter-list .ag-set-filter-item').forEach((item) => {
        const checkbox = item.querySelector<HTMLInputElement>('input[type="checkbox"]');
        const mark = checkbox?.indeterminate ? '▪' : checkbox?.checked ? '☑' : '☐';
        lines.push(`${'  '.repeat(setItemDepth(item))}${mark} ${text(item.querySelector('.ag-checkbox-label'))}`);
    });
}

/** Appends a simple filter's condition rows (operator + visible inputs) separated by the join, scoped to `scope`. */
function serializeSimpleBody(scope: ParentNode, lines: string[]): void {
    const selects = Array.from(scope.querySelectorAll('.ag-filter-select .ag-picker-field-display'));
    const bodies = Array.from(scope.querySelectorAll('.ag-filter-body'));
    const join = Array.from(scope.querySelectorAll('.ag-filter-condition input[type=radio]:checked'))
        .map((r) => text(r.closest('.ag-radio-button')?.querySelector('.ag-radio-button-label')))
        .find(Boolean);

    const conditionCount = Math.max(selects.length, bodies.length);
    for (let i = 0; i < conditionCount; i++) {
        if (i > 0 && join) {
            lines.push(join.toUpperCase());
        }
        lines.push(`operator: "${text(selects[i])}"`);
        const inputs = bodies[i] ? visibleInputs(bodies[i]) : [];
        inputs.forEach((input, idx) => {
            lines.push(`input${inputs.length > 1 ? ` [${idx}]` : ''}: "${input.value}"`);
        });
    }
}

/** Serialises the open column filter popup: operator(s), inputs, join, set items, and buttons. */
export function serializeColumnFilter(root: ParentNode): string {
    const popup = root.querySelector('.ag-filter-menu');
    if (!popup) {
        return 'COLUMN FILTER: (not open)';
    }

    const multi = popup.querySelector('.ag-multi-filter');
    if (multi) {
        return serializeMultiFilter(multi, popup);
    }

    const setList = popup.querySelector('.ag-set-filter-list');
    const lines: string[] = [setList ? 'COLUMN FILTER (set)' : 'COLUMN FILTER'];
    if (setList) {
        serializeSetBody(popup, lines);
    } else {
        serializeSimpleBody(popup, lines);
    }

    const buttons = buttonsLine(Array.from(popup.querySelectorAll<HTMLButtonElement>('.ag-filter-apply-panel button')));
    if (buttons) {
        lines.push(buttons);
    }
    return lines.join('\n');
}

/**
 * Serialises a multi filter popup: each sub-filter renders under a `[simple]`/`[set]` marker (both are
 * shown, unlike a plain popup which shows only the active surface). A hidden wrapper is skipped.
 */
function serializeMultiFilter(multi: Element, popup: Element): string {
    const lines: string[] = ['COLUMN FILTER (multi)'];
    multi.querySelectorAll(':scope > .ag-filter-wrapper').forEach((wrapper) => {
        if (wrapper.classList.contains('ag-hidden')) {
            return;
        }
        const bodyWrapper = wrapper.querySelector('.ag-filter-body-wrapper');
        const isSet = !!bodyWrapper?.classList.contains('ag-set-filter-body-wrapper');
        lines.push(isSet ? '[set]' : '[simple]');
        if (isSet) {
            serializeSetBody(wrapper, lines);
        } else {
            serializeSimpleBody(wrapper, lines);
        }
    });

    const buttons = buttonsLine(Array.from(popup.querySelectorAll<HTMLButtonElement>('.ag-filter-apply-panel button')));
    if (buttons) {
        lines.push(buttons);
    }
    return lines.join('\n');
}

/**
 * Serialises a column's floating filter row: the visible input's value, whether it is read-only (`⊘`), the
 * input type when not plain text, and whether the filter-active indicator is lit. `colId` selects the header cell.
 */
export function serializeFloatingFilter(root: ParentNode, colId: string | undefined): string {
    if (!colId) {
        return 'FLOATING FILTER: (no colId)';
    }
    const cell = root.querySelector(`.ag-header-cell.ag-floating-filter[col-id="${colId}"]`);
    if (!cell) {
        return `FLOATING FILTER ${colId}: (not present)`;
    }
    const body = cell.querySelector('.ag-floating-filter-body, .ag-floating-filter-full-body');
    const input = body
        ? Array.from(body.querySelectorAll<HTMLInputElement>('input')).find((i) => !i.closest('.ag-hidden'))
        : undefined;

    const lines = [`FLOATING FILTER ${colId}`];
    if (input) {
        const typeSuffix = input.type === 'text' ? '' : ` [${input.type}]`;
        lines.push(`input${typeSuffix}: "${input.value}"${input.disabled ? ' ⊘' : ''}`);
    } else {
        lines.push('input: (none)');
    }
    const button = cell.querySelector('.ag-floating-filter-button-button');
    lines.push(`active: ${!!button?.classList.contains('ag-filter-active')}`);
    return lines.join('\n');
}

/** One expanded filter body inside the tool panel: set items or simple condition rows, indented. */
function serializeToolPanelBody(body: Element, indent: string, lines: string[]): void {
    if (body.querySelector('.ag-set-filter-list')) {
        const setLines: string[] = [];
        serializeSetBody(body, setLines);
        for (let i = 0, len = setLines.length; i < len; ++i) {
            lines.push(indent + setLines[i]);
        }
        return;
    }
    const simpleLines: string[] = [];
    serializeSimpleBody(body, simpleLines);
    for (let i = 0, len = simpleLines.length; i < len; ++i) {
        lines.push(indent + simpleLines[i]);
    }
}

/** A tool-panel filter instance (a single column's filter within a group), rendered under `indent`. */
function serializeToolPanelInstance(instance: Element, indent: string, lines: string[]): void {
    const header = instance.querySelector('.ag-filter-toolpanel-instance-header');
    const headerVisible = isVisible(header);
    const body = instance.querySelector('.ag-filter-toolpanel-instance-body');
    if (headerVisible && header) {
        const expanded = header.getAttribute('aria-expanded') === 'true';
        const active = !instance.querySelector('.ag-filter-icon')?.classList.contains('ag-hidden');
        lines.push(
            `${indent}${expanded ? '▾' : '▸'} ${text(header.querySelector('.ag-header-cell-text'))}${active ? ' *' : ''}`
        );
        if (expanded && body) {
            serializeToolPanelBody(body, indent + '  ', lines);
        }
    } else if (body) {
        // A single column renders its filter directly under the group with no instance header.
        serializeToolPanelBody(body, indent, lines);
    }
}

/**
 * Serialises the Filters Tool Panel as an indented tree: expand state + active marker (`*`) per column/group;
 * expanded groups render their instances. Search-hidden/suppressed entries carry `ag-hidden` and are skipped.
 */
export function serializeToolPanel(root: ParentNode): string {
    const panel = root.querySelector('.ag-filter-toolpanel');
    if (!panel) {
        return 'FILTERS TOOL PANEL: (not open)';
    }
    const lines = ['FILTERS TOOL PANEL'];
    panel.querySelectorAll('.ag-filter-list-panel > .ag-filter-toolpanel-group-wrapper').forEach((wrapper) => {
        if (wrapper.classList.contains('ag-hidden')) {
            return;
        }
        const group = wrapper.querySelector('.ag-group');
        const container = wrapper.querySelector('.ag-group-container');
        const expanded = isVisible(container);
        const active = group?.classList.contains('ag-has-filter') ? ' *' : '';
        lines.push(`${expanded ? '▾' : '▸'} ${text(wrapper.querySelector('.ag-group-title'))}${active}`);
        if (expanded) {
            wrapper.querySelectorAll('.ag-filter-toolpanel-instance').forEach((instance) => {
                if (!instance.classList.contains('ag-hidden')) {
                    serializeToolPanelInstance(instance, '  ', lines);
                }
            });
        }
    });
    return lines.join('\n');
}

/** Serialises the advanced filter text editor: input value, validity (+ message), and buttons. */
export function serializeAdvancedFilter(root: ParentNode): string {
    const wrapper = root.querySelector('.ag-advanced-filter');
    const input = wrapper?.querySelector<HTMLInputElement>('input[type=text]');
    if (!wrapper || !input) {
        return 'ADVANCED FILTER: (not present)';
    }

    const message = input.validationMessage;
    const lines = ['ADVANCED FILTER', `input: "${input.value}"`, message ? `valid: false — ${message}` : 'valid: true'];

    const buttons = Array.from(wrapper.querySelectorAll<HTMLButtonElement>('.ag-advanced-filter-buttons button'));
    const builderButton = wrapper.querySelector<HTMLButtonElement>('.ag-advanced-filter-builder-button');
    if (builderButton) {
        buttons.push(builderButton);
    }
    const buttonsStr = buttonsLine(buttons);
    if (buttonsStr) {
        lines.push(buttonsStr);
    }
    return lines.join('\n');
}

interface BuilderRow {
    depth: number;
    text: string;
}

/** Logical nesting depth of a builder item: the root join is 0; otherwise the tree-line count. */
function builderItemDepth(wrapper: Element): number {
    if (wrapper.querySelector('.ag-advanced-filter-builder-item-tree-line-root')) {
        return 0;
    }
    return wrapper.querySelectorAll('.ag-advanced-filter-builder-item-tree-line').length;
}

/**
 * A builder item is flagged invalid only when its error icon is actually shown: the root join's `eValidation`
 * slot keeps the `-invalid` class but has no icon child (`setupValidation` runs for non-root items only).
 */
export function hasVisibleInvalidIcon(wrapper: Element): boolean {
    const icon = wrapper.querySelector('.ag-advanced-filter-builder-invalid');
    return !!icon && icon.childElementCount > 0 && isVisible(icon);
}

/** Display text of a pill, or null when the pill slot is absent (`∅` when present but empty). */
function pillSlot(wrapper: Element, pillClass: string): string | null {
    const pill = wrapper.querySelector(`.${pillClass}`);
    if (!pill) {
        return null;
    }
    return text(pill.querySelector('.ag-advanced-filter-builder-pill-display')) || '∅';
}

/** One condition/join/add row of the builder, with its slots and invalid marker. */
function builderRowText(wrapper: Element): string | null {
    const invalid = hasVisibleInvalidIcon(wrapper) ? ' ✗' : '';
    const column = pillSlot(wrapper, 'ag-advanced-filter-builder-column-pill');
    const join = pillSlot(wrapper, 'ag-advanced-filter-builder-join-pill');

    if (column !== null) {
        // Render every present slot (a 0-operand operator like `is blank` has no value pill).
        const parts = [column];
        const op = pillSlot(wrapper, 'ag-advanced-filter-builder-option-pill');
        if (op !== null) {
            parts.push(op);
        }
        const value = pillSlot(wrapper, 'ag-advanced-filter-builder-value-pill');
        if (value !== null) {
            parts.push(value);
        }
        return parts.join(' ') + invalid;
    }
    if (join !== null) {
        return join + invalid;
    }
    if (wrapper.querySelector('[aria-label="Add Filter or Group"]')) {
        return '+ add';
    }
    return null;
}

/** Serialises the builder as an indented condition tree (exactly as nested), plus buttons. */
export function serializeBuilder(root: ParentNode): string {
    const builder = root.querySelector('.ag-advanced-filter-builder');
    if (!builder) {
        return 'BUILDER: (not open)';
    }

    const rows: BuilderRow[] = [];
    builder.querySelectorAll('.ag-advanced-filter-builder-item-wrapper').forEach((wrapper) => {
        const rowText = builderRowText(wrapper);
        if (rowText !== null) {
            rows.push({ depth: builderItemDepth(wrapper), text: rowText });
        }
    });

    const lines = ['BUILDER'];
    for (let i = 0, len = rows.length; i < len; ++i) {
        lines.push('  '.repeat(rows[i].depth) + rows[i].text);
    }

    const buttons = buttonsLine(
        Array.from(builder.querySelectorAll<HTMLButtonElement>('.ag-filter-apply-panel button'))
    );
    if (buttons) {
        lines.push(buttons);
    }
    return lines.join('\n');
}
