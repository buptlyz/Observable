import { Subscription } from './index'

export function getMethod<T, K extends keyof T>(obj: T, key: K): T[K] {
    const value = obj[key]
    
    if (value === undefined || value === null) return undefined

    if (typeof value !== 'function')
        throw new TypeError(`${value} is not a function`)
    
    return value
}

export function subscriptionClosed(subscription: Subscription) {
    return subscription._observer === undefined
}

export function cleanupSubscription(subscription: Subscription) {
    const cleanup = subscription._cleanup

    if (!cleanup) return
    
    if (typeof cleanup !== 'function') {
        throw new TypeError('')
    }
    
    subscription._cleanup = undefined
    
    try {
        cleanup()
    } catch (err) {
        // HostReportErrors
    }
}

export function cleanupFromSubscription(subscription: Subscription) {
    return _=> {subscription.unsubscribe()}
}

export function closeSubscription(subscription: Subscription) {
    if (subscriptionClosed(subscription)) return

    subscription._observer = undefined
    cleanupSubscription(subscription)
}