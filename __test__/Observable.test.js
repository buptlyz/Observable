const Observable = require('../lib/Observable.js').default

const source$ = new Observable(observer => {
    let count = 1
    const timer = setInterval(() => observer.next(count++), 1000)
    return () => clearTimeout(timer)
})

const subscription1 = source$.subscribe(console.log)
const subscription2 = source$.subscribe(val => console.log('hello: ', val))
setTimeout(() => {
    subscription1.unsubscribe()
    subscription2.unsubscribe()
}, 3000)