import { Observer, SubscriberFunction } from './index'
import Subscription from './Subscription'
import { polyfillSymbol, getMethod } from './utils'

polyfillSymbol('observable')

export default class Observable {
    protected _subscriber: SubscriberFunction

    constructor(subscriber: SubscriberFunction) {
        if (!(this instanceof Observable)) {
            throw new TypeError('Observable is not intended to be called as a function')
        }
        if (typeof subscriber !== 'function') {
            throw new TypeError('Observable initializer must be a function')
        }
        this._subscriber = subscriber
    }

    // TODO replace type any
    [(Symbol as any).observable]() {return this}

    subscribe(observer: Observer): Subscription
    subscribe(next: Function, error: Function, complete: Function, ): Subscription
    subscribe(observer: any, ...args: any[]) {
        if (typeof observer === 'function') {
            // next error complete
            observer = {
                next: observer,
                error: args[0],
                complete: args[1]
            }
        }
        else if (typeof observer !== 'object') {
            observer = {}
        }

        return new Subscription(observer, this._subscriber)
    }

    static from(x: Observable): Observable
    static from(x: Iterable<any>): Observable
    static from(x: any) {
        const C = typeof this === 'function' ? this : Observable

        if (typeof x !== 'object') {
            throw new TypeError(`${x} is not an object`)
        }

        // TODO remove type any
        let method = getMethod(x as any, (Symbol as any).observable)

        if (method) {
            
            // param x is an Observable
            const observable = method.call(x)

            if (Object(observable) !== observable)
                throw new TypeError(`${observable} is not an object`)

            if (observable.constructor === C)
                return observable

            return new C(observer => observable.subscribe(observer))
        }

        // param x is an iterable
        method = getMethod(x, Symbol.iterator)

        if (!method)
            throw new TypeError(`${x} is not observable`)

        return new C((observer: Observer) => {
            for (const item of method.call(x)) {
                observer.next(item)

                if (observer.closed) return
            }

            observer.complete()

            return () => void(0)
        })
    }

    static of(...items: any[]) {
        const C = typeof this === 'function' ? this : Observable

        return new C((observer: Observer) => {
            for (const item of items) {
                observer.next(item)

                if (observer.closed) return
            }

            observer.complete()

            return () => void(0)
        })
    }
}