const { curryN } = require('crocks')

const handle = curryN(3, (airbrake, req, err) => {
  err.action     = req.pathname
  err.component  = 'paperplane'
  err.httpMethod = req.method
  err.params     = req.params
  err.ua         = req.headers['user-agent']
  err.url        = req.protocol + '://' + req.headers.host + req.url
  airbrake.notify(err)
  return Promise.reject(err)
})

module.exports = curryN(2, (airbrake, app) => req =>
  Promise.resolve(req).then(app)
    .catch(handle(airbrake, req)))
