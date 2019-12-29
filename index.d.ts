export interface Observable {}

export interface Observer {
    start?: Function
    next?: Function
    error?: Function
    complete?: Function
}

export interface Subscription {
    _observer: Observer
    _cleanup?: Function
    unsubscribe: Function
}

export interface SubscriptionObserver {
    next: Function
    error: Function
    complete: Function
}