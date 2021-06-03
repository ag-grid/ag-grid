export function classesList(...list: (string | null)[]): string {
    const filtered = list.filter( s => s != null && s != '');
    return filtered.join(' ');
}