"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SubscriptionObserver_1 = require("./SubscriptionObserver");
const utils_1 = require("./utils");
class Subscription {
    constructor(observer, subscriber) {
        this._observer = observer;
        // If the observer has a start method, call it with the subscription object
        try {
            const start = utils_1.getMethod(observer, 'start');
            if (start)
                start.call(observer, this);
        }
        catch (err) {
            // HostReportErrors
        }
        // If the observer has unsubscribed from the start method, exit
        if (utils_1.subscriptionClosed(this))
            return;
        const wrappedObserver = new SubscriptionObserver_1.default(this);
        try {
            // call the subscriber
            let cleanup = subscriber.call(null, wrappedObserver);
            // The return value must be undefined, null, a subscription object, or a function
            if (cleanup !== undefined && cleanup !== null) {
                if (typeof cleanup.unsubscribe === 'function')
                    cleanup = utils_1.cleanupFromSubscription(cleanup);
                else if (typeof cleanup !== 'function')
                    throw new TypeError(`${cleanup} is not a function`);
                this._cleanup = cleanup;
            }
        }
        catch (err) {
            // If an error occurs during startup, then send the error
            // to the observer.
            wrappedObserver.error(err);
            return;
        }
        // If the stream is already finished, then perform cleanup
        if (utils_1.subscriptionClosed(this))
            utils_1.cleanupSubscription(this);
    }
    get closed() { return utils_1.subscriptionClosed(this); }
    unsubscribe() { utils_1.closeSubscription(this); }
}
exports.default = Subscription;
//# sourceMappingURL=Subscription.js.map