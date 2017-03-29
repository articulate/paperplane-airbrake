const { constant } = require('crocks')
const { expect }   = require('chai')
const property     = require('prop-factory')

const handler = require('..')
const spy     = require('./lib/spy')

describe('paperplane-airbrake', function() {
  const airbrake = { notify: spy() }

  const req = {
    headers: {
      'host': 'myapp.com',
      'user-agent': 'Chrome'
    },
    method: 'GET',
    params: { id: 123 },
    pathname: '/users/123',
    protocol: 'https',
    url: '/users/123?token=abc'
  }

  beforeEach(function() {
    airbrake.notify.reset()
  })

  describe('when app errors', function() {
    const app = () => { throw new Error('bad') }

    const err    = property(),
          server = handler(airbrake, app)

    beforeEach(function() {
      return server(req).catch(err)
    })

    it('notifies airbrake', function() {
      expect(airbrake.notify.calls.length).to.equal(1)
      expect(airbrake.notify.calls[0]).to.equal(err())
    })

    it('rejects with the error', function() {
      expect(err()).to.exist
    })

    it('adds the action', function() {
      expect(err().action).to.equal('/users/123')
    })

    it('adds paperplane as the component', function() {
      expect(err().component).to.equal('paperplane')
    })

    it('adds the httpMethod', function() {
      expect(err().httpMethod).to.equal('GET')
    })

    it('adds the params', function() {
      expect(err().params).to.eql({ id: 123 })
    })

    it('adds the ua (user agent)', function() {
      expect(err().ua).to.equal('Chrome')
    })

    it('adds the url', function() {
      expect(err().url).to.equal('https://myapp.com/users/123?token=abc')
    })
  })

  describe('when app succeeds', function() {
    const app = constant({ statusCode: 200 })

    const err    = property(),
          server = handler(airbrake, app)

    beforeEach(function() {
      return server(req).catch(err)
    })

    it('does not notify airbrake', function() {
      expect(airbrake.notify.calls.length).to.equal(0)
      expect(err()).to.be.undefined
    })
  })
})
