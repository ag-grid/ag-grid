const DEFAULT_TYPE_AHEAD_TIMEOUT_MS = 1000;

const normaliseForTypeAhead = (text: string): string =>
    text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();

/**
 * Tracks the text typed into a select-only list and finds the option it moves to.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export class AgTypeAhead {
    private typedText = '';
    private lastTypedTime = 0;

    constructor(private readonly timeoutMs: number = DEFAULT_TYPE_AHEAD_TIMEOUT_MS) {}

    public isActive(): boolean {
        return this.typedText !== '' && Date.now() - this.lastTypedTime <= this.timeoutMs;
    }

    public reset(): void {
        this.typedText = '';
    }

    /**
     * A repeated character cycles through the options starting with it; other text matches the first option starting with it.
     * @returns The index of the matching option, `-1` when none matches, or `null` when the key types no text.
     */
    public type(
        char: string,
        optionCount: number,
        getOptionText: (index: number) => unknown,
        highlightedIndex: number
    ): number | null {
        const typedChar = normaliseForTypeAhead(char);
        if (typedChar === '') {
            return null;
        }
        const typedText = (this.isActive() ? this.typedText : '') + typedChar;
        this.typedText = typedText;
        this.lastTypedTime = Date.now();

        const firstChar = typedText[0];
        const isCycling = typedText === firstChar.repeat(typedText.length);
        const searchText = isCycling ? firstChar : typedText;
        const startIdx = isCycling ? highlightedIndex + 1 : 0;

        for (let i = 0; i < optionCount; ++i) {
            const idx = (startIdx + i) % optionCount;
            // Cell editors can supply non-string option text at runtime.
            const optionText = normaliseForTypeAhead(String(getOptionText(idx) ?? '').trimStart());
            if (optionText.startsWith(searchText)) {
                return idx;
            }
        }
        return -1;
    }
}
