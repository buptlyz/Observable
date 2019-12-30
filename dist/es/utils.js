export function polyfillSymbol(name) {
    if (!Symbol[name]) {
        Object.defineProperty(Symbol, name, { value: Symbol(name) });
    }
}
export function getMethod(obj, key) {
    const value = obj[key];
    if (value === undefined || value === null)
        return undefined;
    if (typeof value !== 'function')
        throw new TypeError(`${value} is not a function`);
    return value;
}
export function subscriptionClosed(subscription) {
    return subscription._observer === undefined;
}
export function cleanupSubscription(subscription) {
    const cleanup = subscription._cleanup;
    if (!cleanup)
        return;
    if (typeof cleanup !== 'function') {
        throw new TypeError(`${cleanup} is not a function`);
    }
    subscription._cleanup = undefined;
    try {
        cleanup();
    }
    catch (err) {
        // HostReportErrors
    }
}
export function cleanupFromSubscription(subscription) {
    return _ => { subscription.unsubscribe(); };
}
export function closeSubscription(subscription) {
    if (subscriptionClosed(subscription))
        return;
    subscription._observer = undefined;
    cleanupSubscription(subscription);
}
//# sourceMappingURL=utils.js.map