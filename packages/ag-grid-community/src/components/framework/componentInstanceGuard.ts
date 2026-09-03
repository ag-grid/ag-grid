/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ComponentInstanceClaim {
    isCurrent(): boolean;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class ComponentInstanceGuard {
    private nextId = 0;
    private invalidatedUpTo = 0;

    /** Claim for a component that replaces any previous one: earlier claims stop being current. */
    public claim(): ComponentInstanceClaim {
        this.invalidatedUpTo = this.nextId;
        return this.provisionalClaim();
    }

    /**
     * Claim issued before knowing whether the previous component survives (e.g. an in-place refresh).
     * Earlier claims stay current until `supersede()` or `invalidate()`.
     */
    public provisionalClaim(): ComponentInstanceClaim {
        const id = ++this.nextId;
        return { isCurrent: () => id > this.invalidatedUpTo };
    }

    /** Invalidate every claim except the most recently issued one. */
    public supersede(): void {
        this.invalidatedUpTo = Math.max(this.invalidatedUpTo, this.nextId - 1);
    }

    /** Invalidate every claim issued so far. */
    public invalidate(): void {
        this.invalidatedUpTo = this.nextId;
    }
}
