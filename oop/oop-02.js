class SyncPromise {
  stack = []

  constructor(executor) {
    let
      resolve,
      reject

    try {
      this.state = 'pending'
      this.value = null

      resolve = (val) => {
        if (this.state !== 'pending') return

        if (val && val.then) {
          val.then(v => {
            const cb = this.stack[0]
            this.value = val
            cb(v)
          })
        } else {
          this.state = 'fulfilled'
          this.value = val
        }
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
      if (this.state === 'fulfilled' && typeof cb === 'function') {
        res(cb(this.value))
      }
      else if (this.state === 'pending' && typeof cb === 'function') {
        this.stack.push(
          (v) => res(cb(v)),
          (v) => rej(cb2(v))
        )}

      else if (this.state === 'rejected' && !cb2) {
        return new SyncPromise((_, rej) => rej(this.value))
      }
    })
  }
}

console.log(1)
let q = new SyncPromise((res) => res(3))
let qq = new SyncPromise((res) => res(Promise.resolve(5)))
console.log(2)
q.then(console.log).then(console.log)
qq.then(console.log).then(console.log)