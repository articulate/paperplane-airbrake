const { expect }   = require('chai')
const property     = require('prop-factory')
const { redirect } = require('paperplane')
const spy          = require('@articulate/spy')

const { partial, path } = require('ramda')

const itAddsRequestDetailsTo = err => {
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
}

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
    const err = property()

    beforeEach(() => {
      const bad = Object.assign(new Error('bad'), { req })
      return cry(bad).catch(err)
    })

    it('notifies airbrake', () => {
      expect(airbrake.notify.calls.length).to.equal(1)
      expect(airbrake.notify.calls[0][0]).to.equal(err())
    })

    itAddsRequestDetailsTo(err)
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

  describe('when notifying airbrake returns an error', () => {
    let error
    const notified = spy()

    const airbrake = {
      notify: (err, cb) => {
        notified(err, cb)
        cb(new Error('bad request'))
      }
    }

    const cry = require('..')(airbrake)
    const err = property()

    before(() => {
      error = console.error
      console.error = spy()
    })

    beforeEach(() => {
      console.error.reset()
      notified.reset()

      const bad = Object.assign(new Error('bad'), { req })
      return cry(bad).catch(err)
    })

    after(() =>
      console.error = error
    )

    it('re-notifies airbrake with the new error', () => {
      expect(notified.calls.length).to.equal(2)
      expect(notified.calls[1][0].message).to.equal('bad request')
    })

    const airbrakeErr =
      partial(path(['calls', 1, 0]), [ notified ])

    itAddsRequestDetailsTo(airbrakeErr)

    it('logs any further errors', () => {
      expect(console.error.calls.length).to.equal(1)
      expect(console.error.calls[0][0].message).to.equal('bad request')
    })
  })
})
