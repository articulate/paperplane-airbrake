const { curry, is, when } = require('ramda')

const addReqData = (req, err) =>
  Object.assign(err, {
    action     : req.pathname,
    component  : 'paperplane',
    httpMethod : req.method,
    params     : req.params,
    ua         : req.headers['user-agent'],
    url        : req.protocol + '://' + req.headers.host + req.url
  })

const cry = (airbrake, err) => {
  if (is(Error, err)) {
    addReqData(err.req, err)

    airbrake.notify(err, when(is(Error), notifyErr => {
      notifyErr.data = { err }
      addReqData(err.req, notifyErr)
      airbrake.notify(notifyErr, when(is(Error), console.error))
    }))
  }

  return Promise.reject(err)
}

module.exports = curry(cry)
