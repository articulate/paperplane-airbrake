<h1 align="center">
  paperplane-airbrake
</h1>
<p align="center">
  An <a href="https://github.com/airbrake/node-airbrake"><code>airbrake</code></a> wrapper for <a href="https://github.com/articulate/paperplane"><code>paperplane</code></a>.
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/paperplane-airbrake"><img src="https://img.shields.io/npm/v/paperplane-airbrake.svg" alt="npm version" style="max-width:100%;"></a> <a href="https://www.npmjs.com/package/paperplane-airbrake"><img src="https://img.shields.io/npm/dm/paperplane-airbrake.svg" alt="npm downloads" style="max-width:100%;"></a> <a href="https://travis-ci.org/articulate/paperplane-airbrake"><img src="https://travis-ci.org/articulate/paperplane-airbrake.svg?branch=master" alt="Build Status" style="max-width:100%;"></a> <a href='https://coveralls.io/github/articulate/paperplane-airbrake?branch=v2'><img src='https://coveralls.io/repos/github/articulate/paperplane-airbrake/badge.svg?branch=v2' alt='Coverage Status' /></a>
</p>

## Usage

```haskell
handler : Airbrake -> (Request -> (Response | Promise Response)) -> Request -> Promise Response
```

Wraps your `paperplane` app to correctly populate `Request` data on caught errors, similar to the built-in `express` and `hapi` handlers for `airbrake`.

```js
const Airbrake  = require('airbrake')
const { mount } = require('paperplane')
const handler   = require('paperplane-airbrake')
const http      = require('http')

const airbrake = Airbrake.createClient(
  process.env.AIRBRAKE_PROJECT_ID,
  process.env.AIRBRAKE_API_KEY,
  process.env.APP_ENV
)

airbrake.addFilter(notice =>
  notice.errors[0].message !== 'Not Found' && notice)

const app = () => { throw new Error('uh oh') }

const server = handler(airbrake, app)

http.createServer(mount(server)).listen(3000)
```
