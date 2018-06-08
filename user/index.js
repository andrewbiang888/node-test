var http = require('http')
var path = require('path')
var HttpHashRouter = require('http-hash-router')
var router = HttpHashRouter()
var getQuery = require('../utils/helper').getQuery
var parseBody = require('../utils/helper').parseBody
var finalhandler = require('finalhandler')
var onError = require('../utils/helper').onError
var serveStatic = require('serve-static')
var sql = require('sqlite3');
var sanitize = require('sqlstring').escape;
var db = new sql.Database(path.dirname(__filename) + '/user.sql');

router.set('/', function (req, res, opts) {
  console.log(req.method)
  var serve = serveStatic("public", {
    index: 'user.html'
  })
  serve(req, res, finalhandler(req, res))
});

router.set('/create', function (req, res, opts) {
  parseBody(req, res, function (body) {
    if (body) {
      var name = body.name
      var email = body.email
      db.run(`INSERT INTO user (name, email) VALUES ('${name}', '${email}')`, function (err) {
        console.log(this.changes)
        if (err) res.end(JSON.stringify({message: 'awe snap. Something went wrong: ' + err}))
        res.end(JSON.stringify({positivemessage: 'Refresh to see new changes'}))
      }) 
    } else {
      res.end(JSON.stringify({message: 'Yo, you didnt send data. wtf?'}))
    }
  });
});

router.set('/update', function (req, res, opts) {
  parseBody(req, res, function (body) {
    if (body) {
      var id = body.id
      var name = body.name
      var email = body.email

      db.run(`UPDATE user SET name = '${name}', email = '${email}' WHERE id = ${id}`, function (err) {
        if (err) res.end(JSON.stringify({message: 'awe snap. Something went wrong with your update: ' + err}))
        res.end(JSON.stringify({positivemessage: 'Update complete! Refresh to see new changes'}))
      }) 
    } else {
      res.end(JSON.stringify({message: 'Yo, you didnt send data. wtf?'}))
    }
  });
});

router.set('/delete', function (req, res, opts) {
  parseBody(req, res, function (body) {
    if (body) {
      var id = body.id
      var name = body.name
      var email = body.email

      db.run(`DELETE FROM user WHERE id = ${id}`, function (err) {
        if (err) res.end(JSON.stringify({message: 'awe snap. Something went wrong with the delete process: ' + err}))
        res.end(JSON.stringify({positivemessage: 'Delete complete! Refresh to see new changes'}))
      }) 
    } else {
      res.end(JSON.stringify({message: 'Yo, you didnt send data. wtf?'}))
    }
  });
});
router.set('/read', function (req, res, opts) {
  db.all('SELECT * FROM user', function(err, rows) {
    if (!rows) res.end(JSON.stringify({message: 'no data in user db!'}));
    res.end(JSON.stringify(rows));
  });
});

router.set('/*', (req, res) => {
  res.end('page not found');
})

http.createServer(function (req, res) {
  console.log(req.url);
  router(req, res, { query: getQuery(req.url) }, onError.bind(null, req, res));
}).listen(9001);