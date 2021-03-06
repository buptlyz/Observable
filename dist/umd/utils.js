(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function polyfillSymbol(name) {
        if (!Symbol[name]) {
            Object.defineProperty(Symbol, name, { value: Symbol(name) });
        }
    }
    exports.polyfillSymbol = polyfillSymbol;
    function getMethod(obj, key) {
        const value = obj[key];
        if (value === undefined || value === null)
            return undefined;
        if (typeof value !== 'function')
            throw new TypeError(`${value} is not a function`);
        return value;
    }
    exports.getMethod = getMethod;
    function subscriptionClosed(subscription) {
        return subscription._observer === undefined;
    }
    exports.subscriptionClosed = subscriptionClosed;
    function cleanupSubscription(subscription) {
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
    exports.cleanupSubscription = cleanupSubscription;
    function cleanupFromSubscription(subscription) {
        return () => { subscription.unsubscribe(); };
    }
    exports.cleanupFromSubscription = cleanupFromSubscription;
    function closeSubscription(subscription) {
        if (subscriptionClosed(subscription))
            return;
        subscription._observer = undefined;
        cleanupSubscription(subscription);
    }
    exports.closeSubscription = closeSubscription;
});
