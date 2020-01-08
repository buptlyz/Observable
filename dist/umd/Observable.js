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
    function checkObservable(ob) {
        if (!(ob instanceof Observable)) {
            throw new TypeError(`${ob} is not a observable`);
        }
    }
    function unsubscribe(sub) {
        if (sub instanceof Subscription_1.default) {
            sub.unsubscribe();
        }
    }
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
        map(fn) {
            if (typeof fn !== 'function') {
                throw new TypeError(`${fn} is not a function`);
            }
            return new Observable(observer => {
                const sub = this.subscribe((val) => observer.next(fn(val)));
                return () => {
                    unsubscribe(sub);
                };
            });
        }
        merge(ob) {
            checkObservable(ob);
            return new Observable(observer => {
                const sub1 = this.subscribe(observer.next);
                const sub2 = ob.subscribe(observer.next);
                return () => {
                    unsubscribe(sub1);
                    unsubscribe(sub2);
                };
            });
        }
        withLatestFrom(ob) {
            checkObservable(ob);
            return new Observable(observer => {
                let val2;
                const sub1 = this.subscribe((val1) => {
                    val2 && observer.next([val1, val2]);
                });
                const sub2 = ob.subscribe((val) => val2 = val);
                return () => {
                    unsubscribe(sub1);
                    unsubscribe(sub2);
                };
            });
        }
        buffer(ob) {
            checkObservable(ob);
            return new Observable(observer => {
                let buffer = [];
                const sub1 = ob.subscribe(() => {
                    observer.next([...buffer]);
                    buffer.length = 0;
                });
                const sub2 = this.subscribe(buffer.push);
                return () => {
                    unsubscribe(sub1);
                    unsubscribe(sub2);
                };
            });
        }
    }
    exports.default = Observable;
    const empty = new Observable(observer => {
        observer.complete();
    });
    function mergeAll(...args) {
        if (args.length === 0)
            return empty;
        if (args.length === 1)
            return args[0];
        return new Observable(observer => {
            const subs = [];
            for (const ob of args) {
                const sub = ob.subscribe(observer.next);
                if (sub instanceof Subscription_1.default)
                    subs.push(sub);
            }
            return () => {
                for (const sub of subs) {
                    sub.unsubscribe();
                }
            };
        });
    }
    exports.mergeAll = mergeAll;
});
