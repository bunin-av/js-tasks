// ## abortablePromise

// > Необходимо написать функцию, которая принимала бы некоторый Promise и экземпляр AbortController и возвращала бы новый. Этот промис можно отменить с помощью использования переданного AbortController. При отмене промис режектится.


const abortablePromise = (promise, controller) => {
  return new Promise((res, rej) => {
    controller.addEventListener('abort', rej, {once: true})
    promise.then(res)
  })
}


const controller = new AbortController();

const myPromise = new Promise(() => 'yo')

const promise = abortablePromise(myPromise, controller.signal).catch(console.error);

controller.abort();


// ## nonNullable

// > Нужно написать функцию, которая принимает функцию и возвращает новую. Новая функция в качестве результата возвращает Promise. Если новой функции передать null в качестве аргументов, то промис должен режектится.

function nonNullable(fn) {
  return function (...params) {
    return new Promise((res, rej) => {
      for (let param of params) {
        if (param === null) rej('argument is null')
      }
      res(fn(...params))
    })
  }
}

function sum(a, b) {
  return a + b;
}

function prod(a, b) {
  return a * b;
}

const sum2 = nonNullable(sum);
const prod2 = nonNullable(prod);

prod2(10, null).then(sum2).catch(console.error);