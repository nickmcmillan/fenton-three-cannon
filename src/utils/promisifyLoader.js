export const promisifyLoader = function (loader, onProgress) {
  function promiseLoader(url) {

    return new Promise((resolve, reject) => {
      loader.load(url, resolve, onProgress, reject)
    })
  }

  return {
    originalLoader: loader,
    load: promiseLoader,
  }
}