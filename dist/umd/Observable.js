var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Subscription", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Subscription_1 = __importDefault(require("./Subscription"));
    const utils_1 = require("./utils");
    utils_1.polyfillSymbol('observable');
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
        static from(x) {
            const C = typeof this === 'function' ? this : Observable;
            if (typeof x !== 'object') {
                throw new TypeError(`${x} is not an object`);
            }
            let method = utils_1.getMethod(x, Symbol.observable);
            if (method) {
                // param x is an Observable
                const observable = method.call(x);
                if (Object(observable) !== observable)
                    throw new TypeError(`${observable} is not an object`);
                if (observable.constructor === C)
                    return observable;
                return new C(observer => observable.subscribe(observer));
            }
            // param x is an iterable
            method = utils_1.getMethod(x, Symbol.iterator);
            if (!method)
                throw new TypeError(`${x} is not observable`);
            return new C((observer) => {
                for (const item of method.call(x)) {
                    observer.next(item);
                    if (observer.closed)
                        return;
                }
                observer.complete();
            });
        }
        static of(...items) {
            const C = typeof this === 'function' ? this : Observable;
            return new C((observer) => {
                for (const item of items) {
                    observer.next(item);
                    if (observer.closed)
                        return;
                }
                observer.complete();
            });
        }
    }
    exports.default = Observable;
});
