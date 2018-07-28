const { always }   = require('ramda')
const { expect }   = require('chai')
const property     = require('prop-factory')
const { redirect } = require('paperplane')
const spy          = require('@articulate/spy')

describe('paperplane-airbrake', () => {
  const airbrake = { notify: spy() }

  const cry = require('..')(airbrake)

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

  beforeEach(() =>
    airbrake.notify.reset()
  )

  describe('when app errors', () => {
    const bad = Object.assign(new Error('bad'), { req })
    const err = property()

    beforeEach(() =>
      cry(bad).catch(err)
    )

    it('notifies airbrake', () => {
      expect(airbrake.notify.calls.length).to.equal(1)
      expect(airbrake.notify.calls[0][0]).to.equal(err())
    })

    it('rejects with the error', () =>
      expect(err()).to.exist
    )

    it('adds the action', () =>
      expect(err().action).to.equal('/users/123')
    )

    it('adds paperplane as the component', () =>
      expect(err().component).to.equal('paperplane')
    )

    it('adds the httpMethod', () =>
      expect(err().httpMethod).to.equal('GET')
    )

    it('adds the params', () =>
      expect(err().params).to.eql({ id: 123 })
    )

    it('adds the ua (user agent)', () =>
      expect(err().ua).to.equal('Chrome')
    )

    it('adds the url', () =>
      expect(err().url).to.equal('https://myapp.com/users/123?token=abc')
    )
  })

  describe('when rejection is a response and not an error', () => {
    const notAnError = redirect('/elsewhere')
    const res = property()

    beforeEach(() =>
      cry(notAnError).catch(res)
    )

    it('does not notify airbrake', () => {
      expect(airbrake.notify.calls.length).to.equal(0)
      expect(res().statusCode).to.equal(302)
    })
  })
})
