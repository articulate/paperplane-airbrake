const { curryN }         = require('crocks')
const { flip, is, when } = require('ramda')

const addReqData = (err, req) =>
  when(is(Error), flip(Object.assign)({
    action     : req.pathname,
    component  : 'paperplane',
    httpMethod : req.method,
    params     : req.params,
    ua         : req.headers['user-agent'],
    url        : req.protocol + '://' + req.headers.host + req.url
  }))(err)

const handle = curryN(3, (airbrake, req, err) => {
  const error = addReqData(err, req)

  airbrake.notify(error, when(is(Error), e => {
    const notifyErr = addReqData(e, req)
    notifyErr.data = { err }

    airbrake.notify(notifyErr, when(is(Error), console.error))
  }))

  return Promise.reject(error)
})

module.exports = curryN(2, (airbrake, app) => req =>
  Promise.resolve(req).then(app)
    .catch(handle(airbrake, req)))
