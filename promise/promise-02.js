// ## abortablePromise

// > Необходимо написать функцию, которая принимала бы некоторый Promise и экземпляр AbortController и возвращала бы новый. Этот промис можно отменить с помощью использования переданного AbortController. При отмене промис режектится.


const abortablePromise = (promise, controller) => {
  return promise.then(d => {
    if (controller.aborted) throw new Error('aborted')
    return d
  })
}
const abortablePromise2 = (promise, controller) => {
  return new Promise((res, rej)=>{
    promise.then(d => {
      if (controller.aborted) rej('aborted')
      res(d)
    })
  })
}


const controller = new AbortController();

const myPromise = Promise.resolve(1)

abortablePromise(myPromise, controller.signal).catch(console.error);

controller.abort();