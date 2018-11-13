// https://stackoverflow.com/a/1527820/2255980
export default function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}