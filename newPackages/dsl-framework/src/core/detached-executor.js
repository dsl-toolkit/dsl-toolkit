/* eslint-disable brace-style */
/* eslint-disable block-spacing */
export default (data, callback) => {
  let timeoutSate = null
  if (callback && typeof callback === 'function') {
    timeoutSate = setTimeout(callback, 0, 2, data)}
  return timeoutSate}
