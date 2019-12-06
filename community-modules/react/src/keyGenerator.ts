let counter = 0;
export default function generateNewKey() {
    return `agPortalKey_${++counter}`;
}
