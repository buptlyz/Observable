export type SubscriberFunction = (observer: SubscriptionObserver) => (() => void) | Subscription | void

declare global {
    interface SymbolConstructor {
        observable: symbol
        [key: string]: any
    }
}

export default class Observable {

    constructor(subscriber : SubscriberFunction)

    // Subscribes to the sequence with an observer
    subscribe(observer : Observer) : Subscription

    // Subscribes to the sequence with callbacks
    subscribe(onNext : Function,
              onError? : Function,
              onComplete? : Function) : Subscription

    // Returns itself
    [Symbol.observable]() : Observable

    // Converts items to an Observable
    static of(...items: any[]) : Observable

    // Converts an observable or iterable to an Observable
    static from(observable: Observable) : Observable

    // operators
    map(fn: Function) : Observable
    // merge(ob: Observable) : Observable
    // withLatestFrom(ob: Observable) : Observable
    // buffer(ob: Observable) : Observable
}

export class Subscription {

    constructor(observer: Observer, subscriber : SubscriberFunction)

    // Cancels the subscription
    unsubscribe() : void

    // A boolean value indicating whether the subscription is closed
    get closed() : Boolean
}

export class Observer {

    // Receives the subscription object when `subscribe` is called
    start?(subscription : Subscription): void

    // Receives the next value in the sequence
    next(value: any): void

    // Receives the sequence error
    error(errorValue: any): void

    // Receives a completion notification
    complete(): void

    get closed(): Boolean
}

export class SubscriptionObserver {

    // Sends the next value in the sequence
    next(value: any): void

    // Sends the sequence error
    error(errorValue: any): void

    // Sends the completion notification
    complete(): void

    // A boolean value indicating whether the subscription is closed
    get closed() : Boolean
}

export declare function mergeAll(...args: Observable[]): Observable;