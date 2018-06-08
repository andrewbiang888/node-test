var http = require('http')
var path = require('path')
var httpProxy = require('http-proxy')
var HttpHashRouter = require('http-hash-router')
var router = HttpHashRouter()
var proxy = httpProxy.createProxyServer();
var getQuery = require('./utils/helper').getQuery
var onError = require('./utils/helper').onError
var finalhandler = require('finalhandler')
var serveStatic = require('serve-static')
var morgan = require('morgan')
var logger = morgan('combined')


router.set('/', (req, res) => {
  var serve = serveStatic("public", {
    index: 'home.html'
  })
  serve(req, res, finalhandler(req, res))
})
router.set('/user', (req, res, opts) => {
  proxy.web(req, res, {
    target: 'http://localhost:9001',
    ignorePath: true
  });
})
router.set('/user/*', (req, res, opts) => {
  var path = opts.splat
  if (opts.splat === null)
    path = ''
  proxy.web(req, res, {
    target: 'http://localhost:9001/' + path,
    ignorePath: true
  });
})
router.set('/book', (req, res, opts) => {
  proxy.web(req, res, {
    target: 'http://localhost:9002',
    ignorePath: true
  });
})
router.set('/book/*', (req, res, opts) => {
  var path = opts.splat
  if (opts.splat === null)
    path = ''
  proxy.web(req, res, {
    target: 'http://localhost:9002/' + path,
    ignorePath: true
  });
})

router.set('/*', (req, res) => {
  res.end('page not found');
})


http.createServer(function (req, res) {
  console.log(req.url)
  console.log('inside /', path.dirname(__filename))
  logger(req, res, function (err) {
    if (err) return done(err)
    router(req, res, { query: getQuery(req.url) }, onError.bind(null, req, res));
  })
}).listen(9000);

