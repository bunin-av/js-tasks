// ## abortablePromise

// > Необходимо написать функцию, которая принимала бы некоторый Promise и экземпляр AbortController и возвращала бы новый. Этот промис можно отменить с помощью использования переданного AbortController. При отмене промис режектится.


const abortablePromise = (promise, controller) => {
  return new Promise((res, rej) => {
    controller.onabort = rej
    promise.then(res)
  })
}


const controller = new AbortController();

const myPromise = new Promise(()=> 'yo')

const promise = abortablePromise(myPromise, controller.signal).catch(console.error);

controller.abort();