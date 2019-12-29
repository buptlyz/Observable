import { Observer } from './index'
import Subscription from './Subscription'

function polyfillSymbol(name) {
    if (!Symbol[name]) {
        Object.defineProperty(Symbol, name, { value: Symbol(name) })
    }
}

polyfillSymbol('observable')

export default class Observable {
    protected _subscriber: Function

    constructor(subscriber: Function) {
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

    subscribe(observer: Observer | Function, ...args: any[]) {
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

    // TODO
    static from() {}

    // TODO
    static of() {}
}