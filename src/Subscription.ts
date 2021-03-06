import { Observer, SubscriberFunction } from '../index'
import SubscriptionObserver from './SubscriptionObserver'
import { getMethod, subscriptionClosed, cleanupSubscription, closeSubscription, cleanupFromSubscription } from './utils'

export default class Subscription {
    _observer?: Observer
    _cleanup?: () => void | Subscription

    constructor(observer: Observer, subscriber: SubscriberFunction) {
        this._observer = observer

        // If the observer has a start method, call it with the subscription object
        try {
            const start = getMethod(observer, 'start')

            if (start) start.call(observer, this)
        } catch (err) {
            // HostReportErrors
        }

        // If the observer has unsubscribed from the start method, exit
        if (subscriptionClosed(this)) return

        const wrappedObserver = new SubscriptionObserver(this)

        try {
            // call the subscriber
            let cleanup = subscriber.call(null, wrappedObserver)

            // The return value must be undefined, null, a subscription object, or a function
            if (cleanup !== undefined && cleanup !== null) {
                if (typeof (cleanup as Subscription).unsubscribe === 'function')
                    cleanup = cleanupFromSubscription(cleanup as Subscription)
                else if (typeof cleanup !== 'function')
                    throw new TypeError(`${cleanup} is not a function`)
                
                this._cleanup = cleanup
            }
        } catch (err) {
            // If an error occurs during startup, then send the error
            // to the observer.
            wrappedObserver.error(err)
            return
        }

        // If the stream is already finished, then perform cleanup
        if (subscriptionClosed(this))
            cleanupSubscription(this)
    }

    get closed() {return subscriptionClosed(this)}
    unsubscribe() {closeSubscription(this)}
}