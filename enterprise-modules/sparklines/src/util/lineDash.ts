export function getLineDash(lineCap: 'butt' | 'square' | 'round' | undefined, lineDash?: string): number[] {

    const buttOrNull: { [key: string]: number[] } = {
        solid: [],
        dash: [4, 3],
        dot: [1, 3],
        dashDot: [4, 3, 1, 3],
        dashDotDot: [4, 3, 1, 3, 1, 3],
        shortDot: [1, 1],
        shortDash: [3, 1],
        shortDashDot: [3, 1, 1, 1],
        shortDashDotDot: [3, 1, 1, 1, 1, 1],
        longDash: [8, 3],
        longDashDot: [8, 3, 1, 3],
        longDashDotDot: [8, 3, 1, 3, 1, 3]
    };

    const roundOrSquare: { [key: string]: number[] } = {
        solid: [],
        dash: [3, 3],
        dot: [0, 3],
        dashDot: [3, 3, 0, 3],
        dashDotDot: [3, 3, 0, 3, 0, 3],
        shortDot: [0, 2],
        shortDash: [2, 2],
        shortDashDot: [2, 2, 0, 2],
        shortDashDotDot: [2, 2, 0, 2, 0, 2],
        longDash: [7, 3],
        longDashDot: [7, 3, 0, 3],
        longDashDotDot: [7, 3, 0, 3, 0, 3]
    };


    if (lineCap === 'round' || lineCap === 'square') {
        return roundOrSquare[lineDash || 'solid'];
    }

    return buttOrNull[lineDash || 'solid'];
}