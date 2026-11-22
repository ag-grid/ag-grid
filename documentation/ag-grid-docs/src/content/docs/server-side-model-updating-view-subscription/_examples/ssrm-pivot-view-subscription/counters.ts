// Bookkeeping for the counters above the grid. Not needed to use the view subscription.

let subscribedCount = 0;
let updatesSent = 0;

/** Records rows the grid subscribed, and the number of rows now subscribed. */
export function recordSubscribed(count: number, totalSubscribed: number) {
    console.log(`subscribe ${count}`);
    subscribedCount = totalSubscribed;
    render();
}

/** Records rows the grid unsubscribed, and the number of rows still subscribed. */
export function recordUnsubscribed(count: number, totalSubscribed: number) {
    console.log(`unsubscribe ${count}`);
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

/** Shows the number of rows the server streams. */
export function recordStreamed(count: number) {
    setText('#streamedCount', String(count));
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
