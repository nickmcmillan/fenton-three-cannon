// http://davidwalsh.name/javascript-debounce-function
export default function (func, wait) {
  let timeout

  return function () {

    const later = () => {
      timeout = null
      func.apply(this, arguments)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}