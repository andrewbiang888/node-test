var URL = require('url')

function parseBody (req, res, cb) {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', function (chunk) {
        body += chunk.toString()
    });
    req.on('end', function () {
      cb(JSON.parse(body))
    });
  }
}
function getQuery (url) {
  return URL.parse(url, true).query
}

function onError (req, res, err) {
  if (!err) return

  res.statusCode = err.statusCode || 500
  res.end();
  // logError(req, res, err)
  // sendJson(req, res, {
  //   error: err.message || http.STATUS_CODES[res.statusCode]
  // })
}
function logError (req, res, err) {
  if (process.env.NODE_ENV === 'test') return

  var logType = res.statusCode >= 500 ? 'error' : 'warn'

  console[logType]({
    err: err,
    requestId: req.id,
    statusCode: res.statusCode
  }, err.message)
}
module.exports = {
  getQuery,
  logError,
  onError,
  parseBody
}