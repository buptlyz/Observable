import Subscription from './Subscription'
import { getMethod, subscriptionClosed, cleanupSubscription } from './utils'

export default class SubscriptionObserver {
    protected _subscription: Subscription

    constructor(subscription: Subscription) {
        this._subscription = subscription
    }

    get closed() {return subscriptionClosed(this._subscription)}

    next(value: any) {
        const subscription = this._subscription

        if (subscriptionClosed(subscription)) return

        const observer = subscription._observer!

        try {
            const next = getMethod(observer, 'next')

            // If the observer doesn't support "next", then return undefined
            if (!next) return

            // Send the next value to the sink
            next.call(observer, value)
        } catch (err) {
            // HostReportErrors
        }
        return
    }

    error(err: any) {
        const subscription = this._subscription

        // If the stream is closed, then return undefined
        if (subscriptionClosed(subscription)) return

        const observer = subscription._observer!
        subscription._observer = undefined

        try {
            const error = getMethod(observer, "error")

            // If the sink does not support "error", then return undefined
            if (error) {
                error.call(observer, err)
            }
        } catch (err) {
            // HostReportErrors
        }

        cleanupSubscription(subscription)
        return
    }

    complete() {
        const subscription = this._subscription

        // If the stream is closed, then return undefined
        if (subscriptionClosed(subscription)) return

        const observer = subscription._observer!
        subscription._observer = undefined

        try {
            const complete = getMethod(observer, "complete")

            // If the sink does not support "complete", then return undefined
            if (complete) {
                complete.call(observer)
            }
        } catch (err) {
            // HostReportErrors
        }

        cleanupSubscription(subscription)
        return
    }
}