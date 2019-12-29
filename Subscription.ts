import { Observer, Subscription as ISubscription } from './index'
import SubscriptionObserver from './SubscriptionObserver'
import { getMethod, subscriptionClosed, cleanupSubscription, closeSubscription, cleanupFromSubscription } from './utils'

export default class Subscription implements ISubscription {
    _observer: Observer
    _cleanup?: Function

    constructor(observer: Observer, subscriber: Function) {
        this._observer = observer

        // If the observer has a start method, call it with the subscription object
        try {
            const start = getMethod<Observer, keyof Observer>(observer, 'start')

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
                if (typeof cleanup.unsubscribe === 'function')
                    cleanup = cleanupFromSubscription(cleanup)
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