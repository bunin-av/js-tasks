class SyncPromise {

  constructor(executor) {
    this.state = 'pending'

    this.value = undefined
    this.reason = undefined

    this.onFulfilled = []
    this.onRejected = []

    let
      resolve,
      reject

    try {
      resolve = (value) => {
        console.log('resolve')
        if (this.state !== 'pending') return

        if (value && typeof value.then === 'function') {
          value.then(resolve, reject)
          return
        }

        this.state = 'fulfilled'
        this.value = value

        this.onFulfilled.forEach(el => el(this.value))
      }

      reject = (reason) => {
        if (this.state !== 'pending') return

        this.state = 'rejected'
        this.reason = reason

        Promise.resolve().then(() => {
          if (this.onRejected.length === 0) return Promise.reject(this.reason)
        })

        queueMicrotask(() => {
          if (this.onRejected.length === 0) return Promise.reject(this.reason)
        })

        this.onRejected.forEach(el => el(this.reason))
      }

      executor(resolve, reject)

    } catch (e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {
    return new SyncPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        try {
          typeof onFulfilled === 'function' ? resolve(onFulfilled(this.value)) : this.value
        } catch (e) {
          reject(e)
        }
        return
      }

      if (this.state === 'rejected') {
        if (typeof onRejected === 'function') {
          try {
            resolve(onRejected(this.reason))
          } catch (e) {
            reject(e)
          }
        } else reject(this.reason)
        return
      }

      if (this.state === 'pending') {
        this.onFulfilled.push(v => resolve(onFulfilled(v)))
      }
      if (this.state === 'pending' && typeof onRejected === 'function') {
        this.onRejected.push(e => reject(onFulfilled(e)))
      }
      if (this.state === 'rejected' && !onRejected) {
        return new SyncPromise((_, rej) => rej(this.value))
      }
    })
  }


  static all(iterable) {
    return new SyncPromise((res, rej) => {
      const arr = [...iterable]
      if (arr.length === 0) res()
      const resArr = []

      for (const el of iterable) {
        Promise.resolve(el)
          .then(
            value => resArr.push(value),
            rej
          )
          .finally(() => resArr.length === arr.length && res(resArr))
      }
    })
  }

  static allSettled(iterable) {
    return new SyncPromise((res) => {
      const arr = [...iterable]
      const resArr = []
      if (arr.length === 0) res(resArr)

      for (const el of iterable) {
        Promise.resolve(el)
          .then(
            value => resArr.push({status: 'fulfilled', value}),
            err => resArr.push({status: 'rejected', reason: err})
          )
          .finally(() => resArr.length === arr.length && res(resArr))
      }
    })
  }

  static race(iterable) {
    return new SyncPromise((res, rej) => {
      const arr = [...iterable]
      if (arr.length === 0) res()

      for (const el of iterable) {
        Promise.resolve(el).then(res, rej)
      }
    })
  }

  static any(iterable) {
    return new SyncPromise((res, rej) => {
      const arr = [...iterable]
      if (arr.length === 0) res()
      const resArr = []

      for (const el of iterable) {
        Promise.resolve(el)
          .then(
            res,
            err => resArr.push(err)
          )
          .finally(() => resArr.length === arr.length && rej(resArr))
      }
    })
  }

  static resolve(value) {
    return new SyncPromise(res => res(value))
  }

  static reject(reason) {
    return new SyncPromise((_, rej) => rej(reason))
  }

}

console.log(1)
let q = new SyncPromise((res) => res(3))
q.then(console.log)
// let qq = new SyncPromise((res) => res(Promise.resolve(5)))
console.log(2)


  .then(console.log)
qq.then(console.log).then(console.log)
