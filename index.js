const { curryN }   = require('crocks')
const { is, when } = require('ramda')

const addReqData = (req, err) =>
  Object.assign(err, {
    action     : req.pathname,
    component  : 'paperplane',
    httpMethod : req.method,
    params     : req.params,
    ua         : req.headers['user-agent'],
    url        : req.protocol + '://' + req.headers.host + req.url
  })

const handle = curryN(3, (airbrake, req, err) => {
  airbrake.notify(addReqData(req, err), when(is(Error), notifyErr => {
    notifyErr.data = { err }
    airbrake.notify(addReqData(req, notifyErr), when(is(Error), console.error))
  }))

  return Promise.reject(err)
})

module.exports = curryN(2, (airbrake, app) => req =>
  Promise.resolve(req).then(app)
    .catch(handle(airbrake, req)))
