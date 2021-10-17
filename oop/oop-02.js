class SyncPromise {
  stack = []

  constructor(executor) {
    let resolve
    let reject

    try {
      this.state = 'pending'
      this.value = null

      resolve = (val) => {
        if (this.state !== 'pending') return
        this.state = 'fulfilled'
        if (this.stack.length > 0) {
          const cb = this.stack.pop()
          val.then(cb)
          return
        }
        this.value = val
      }

      reject = (val) => {
        if (this.state !== 'pending') return
        this.state = 'rejected'
        this.value = val
      }

      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(cb, cb2) {
    return new SyncPromise((res, rej) => {
      if (this.state === 'fulfilled') {
        if (typeof cb === 'function') {
          if (this.value.then) {
            this.stack.push(res)
          } else {
            res(cb(this.value))
          }
        }
      }

      if (this.state === 'rejected' && !cb2) {
        return new SyncPromise((_, rej) => rej(this.value))
      }
    })
  }
}

console.log(1)
let q = new SyncPromise((res) => res(3))
// let q = new SyncPromise((res) => res(Promise.resolve(3)))
console.log(2)
q.then(console.log)