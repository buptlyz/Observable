export type SubscriberFunction = (observer: SubscriptionObserver) => (() => void) | Subscription

export class Observable {

    constructor(subscriber : SubscriberFunction)

    // Subscribes to the sequence with an observer
    subscribe(observer : Observer) : Subscription

    // Subscribes to the sequence with callbacks
    subscribe(onNext : Function,
              onError? : Function,
              onComplete? : Function) : Subscription

    // TODO fix lint
    // Returns itself
    [Symbol.observable]() : Observable

    // Converts items to an Observable
    static of(...items) : Observable

    // Converts an observable or iterable to an Observable
    static from(observable) : Observable

}

export class Subscription {

    // Cancels the subscription
    unsubscribe() : void

    // A boolean value indicating whether the subscription is closed
    get closed() : Boolean
}

export class Observer {

    // Receives the subscription object when `subscribe` is called
    start(subscription : Subscription): void

    // Receives the next value in the sequence
    next(value): void

    // Receives the sequence error
    error(errorValue): void

    // Receives a completion notification
    complete(): void

    get closed(): Boolean
}

export class SubscriptionObserver {

    // Sends the next value in the sequence
    next(value)

    // Sends the sequence error
    error(errorValue)

    // Sends the completion notification
    complete()

    // A boolean value indicating whether the subscription is closed
    get closed() : Boolean
}