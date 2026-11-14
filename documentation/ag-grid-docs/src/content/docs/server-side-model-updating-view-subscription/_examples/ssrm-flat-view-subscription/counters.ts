// Bookkeeping for the counters above the grid. Not needed to use the view subscription.

let subscribedCount = 0;
let updatesSent = 0;

/** Records the number of rows now subscribed. */
export function recordSubscribed(totalSubscribed: number) {
    subscribedCount = totalSubscribed;
    render();
}

/** Records the number of rows still subscribed after an unsubscribe. */
export function recordUnsubscribed(totalSubscribed: number) {
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

function render() {
    setText('#subscribedCount', String(subscribedCount));
    setText('#updatesSent', String(updatesSent));
}

function setText(selector: string, text: string) {
    // the grid unsubscribes its rows when destroyed, which can happen after the counters are removed
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = text;
    }
}
