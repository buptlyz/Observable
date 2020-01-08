import { Observer, SubscriberFunction } from '../index'
import Subscription from './Subscription'
import { polyfillSymbol, getMethod } from './utils'

function checkObservable(ob: any) {
    if (!(ob instanceof Observable)) {
        throw new TypeError(`${ob} is not a observable`)
    }
}

function unsubscribe(sub: any) {
    if (sub instanceof Subscription) {
        sub.unsubscribe()
    }
}

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

    [Symbol.observable]() {return this}

    subscribe(observer: Observer): Subscription
    subscribe(next: Function, error?: Function, complete?: Function, ): Subscription
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

        let method = getMethod(x as any, Symbol.observable)

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
        })
    }

    map(fn: Function) {
        if (typeof fn !== 'function') {
            throw new TypeError(`${fn} is not a function`)
        }
        return new Observable(observer => {
            const sub = this.subscribe((val: any) => observer.next(fn(val)))
    
            return () => {
                unsubscribe(sub)
            }
        })
    }

    merge(ob: Observable) {
        checkObservable(ob)
        return new Observable(observer => {
            const sub1 = this.subscribe(observer.next)
            const sub2 = ob.subscribe(observer.next)
            return () => {
                unsubscribe(sub1)
                unsubscribe(sub2)
            }
        })
    }

    withLatestFrom(ob: Observable) {
        checkObservable(ob)
        return new Observable(observer => {
            let val2: any
            const sub1 = this.subscribe((val1: any) => {
                val2 && observer.next([val1, val2])
            })
            const sub2 = ob.subscribe((val: any) => val2 = val)
            return () => {
                unsubscribe(sub1)
                unsubscribe(sub2)
            }
        })
    }

    buffer(ob: Observable) {
        checkObservable(ob)
        return new Observable(observer => {
            let buffer: any[] = []
            const sub1 = ob.subscribe(() => {
                observer.next([...buffer])
                buffer.length = 0
            })
            const sub2 = this.subscribe(buffer.push)
            return () => {
                unsubscribe(sub1)
                unsubscribe(sub2)
            }
        })
    }
}

const empty = new Observable(observer => {
    observer.complete()
})

export function mergeAll(...args: Observable[]) {
    if (args.length === 0)
        return empty
    if (args.length === 1)
        return args[0]
    return new Observable(observer => {
        const subs: Subscription[] = []
        for (const ob of args) {
            const sub = ob.subscribe(observer.next)
            if (sub instanceof Subscription)
                subs.push(sub)
        }
        return () => {
            for (const sub of subs) {
                sub.unsubscribe()
            }
        }
    })
}