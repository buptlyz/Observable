(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const utils_1 = require("./utils");
    class SubscriptionObserver {
        constructor(subscription) {
            this._subscription = subscription;
        }
        get closed() { return utils_1.subscriptionClosed(this._subscription); }
        next(value) {
            const subscription = this._subscription;
            if (utils_1.subscriptionClosed(subscription))
                return;
            const observer = subscription._observer;
            try {
                const next = utils_1.getMethod(observer, 'next');
                // If the observer doesn't support "next", then return undefined
                if (!next)
                    return;
                // Send the next value to the sink
                next.call(observer, value);
            }
            catch (err) {
                // HostReportErrors
            }
            return;
        }
        error(err) {
            const subscription = this._subscription;
            // If the stream is closed, then return undefined
            if (utils_1.subscriptionClosed(subscription))
                return;
            const observer = subscription._observer;
            subscription._observer = undefined;
            try {
                const error = utils_1.getMethod(observer, "error");
                // If the sink does not support "error", then return undefined
                if (error) {
                    error.call(observer, err);
                }
            }
            catch (err) {
                // HostReportErrors
            }
            utils_1.cleanupSubscription(subscription);
            return;
        }
        complete() {
            const subscription = this._subscription;
            // If the stream is closed, then return undefined
            if (utils_1.subscriptionClosed(subscription))
                return;
            const observer = subscription._observer;
            subscription._observer = undefined;
            try {
                const complete = utils_1.getMethod(observer, "complete");
                // If the sink does not support "complete", then return undefined
                if (complete) {
                    complete.call(observer);
                }
            }
            catch (err) {
                // HostReportErrors
            }
            utils_1.cleanupSubscription(subscription);
            return;
        }
    }
    exports.default = SubscriptionObserver;
});
