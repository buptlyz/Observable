"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Subscription_1 = require("./Subscription");
function polyfillSymbol(name) {
    if (!Symbol[name]) {
        Object.defineProperty(Symbol, name, { value: Symbol(name) });
    }
}
polyfillSymbol('observable');
class Observable {
    constructor(subscriber) {
        if (!(this instanceof Observable)) {
            throw new TypeError('Observable is not intended to be called as a function');
        }
        if (typeof subscriber !== 'function') {
            throw new TypeError('Observable initializer must be a function');
        }
        this._subscriber = subscriber;
    }
    // TODO replace type any
    [Symbol.observable]() { return this; }
    subscribe(observer, ...args) {
        if (typeof observer === 'function') {
            // next error complete
            observer = {
                next: observer,
                error: args[0],
                complete: args[1]
            };
        }
        else if (typeof observer !== 'object') {
            observer = {};
        }
        return new Subscription_1.default(observer, this._subscriber);
    }
    // TODO
    static from() { }
    // TODO
    static of() { }
}
exports.default = Observable;
//# sourceMappingURL=Observable.js.map