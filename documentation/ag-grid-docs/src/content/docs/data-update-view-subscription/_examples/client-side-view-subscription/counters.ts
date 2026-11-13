// Bookkeeping for the counters above the grid. Not needed to use the view subscription.

let subscribedCount = 0;
let updatesSent = 0;
// the rows subscribed and unsubscribed by the last change, which the grid reports in one task
let lastChange: { subscribed: number; unsubscribed: number } | undefined;

/** Records rows the grid subscribed, and the number of rows now subscribed. */
export function recordSubscribed(count: number, totalSubscribed: number) {
    console.log(`subscribe ${count}`);
    addToLastChange(count, 0);
    subscribedCount = totalSubscribed;
    render();
}

/** Records rows the grid unsubscribed, and the number of rows still subscribed. */
export function recordUnsubscribed(count: number, totalSubscribed: number) {
    console.log(`unsubscribe ${count}`);
    addToLastChange(0, count);
    subscribedCount = totalSubscribed;
    if (totalSubscribed === 0) {
        // nothing is streamed now, so start counting again
        updatesSent = 0;
    }
    render();
}

/** Records row updates received from the server. */
export function recordUpdates(count: number) {
    updatesSent += count;
    render();
}

function addToLastChange(subscribed: number, unsubscribed: number) {
    if (!lastChange) {
        lastChange = { subscribed: 0, unsubscribed: 0 };
        // the next change starts a new count
        queueMicrotask(() => (lastChange = undefined));
    }
    lastChange.subscribed += subscribed;
    lastChange.unsubscribed += unsubscribed;
}

function render() {
    setText('#subscribedCount', String(subscribedCount));
    if (lastChange) {
        setText('#lastChange', `+${lastChange.subscribed} −${lastChange.unsubscribed}`);
    }
    setText('#updatesSent', String(updatesSent));
}

function setText(selector: string, text: string) {
    // the grid unsubscribes its rows when destroyed, which can happen after the counters are removed
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = text;
    }
}
