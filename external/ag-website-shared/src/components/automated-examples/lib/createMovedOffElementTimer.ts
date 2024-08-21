export interface InitMovedOffElementTimerParams {
    timerIsEnabled: () => boolean;
    isMovedOn: (element: HTMLElement) => boolean;
    onTimerFinished: () => void;
    waitTime: number;
}

export type MovedOffElementTimer = ReturnType<typeof createMovedOffElementTimer>;

export function createMovedOffElementTimer({
    timerIsEnabled,
    isMovedOn,
    onTimerFinished,
    waitTime,
}: InitMovedOffElementTimerParams) {
    let timer;

    document.body.addEventListener('mousemove', (event: MouseEvent) => {
        const element = event.target as HTMLElement;

        if (!timerIsEnabled()) {
            cancelTimer();
            return;
        }

        const hoveredOver = isMovedOn(element);
        if (hoveredOver) {
            cancelTimer();
        } else {
            if (timer) {
                return;
            }
            timer = setTimeout(() => {
                onTimerFinished();
            }, waitTime);
        }
    });

    const cancelTimer = () => {
        clearTimeout(timer);
        timer = undefined;
    };

    return {
        cancelTimer,
    };
}
