var express = require('express');
var app = express();
var swagger = require('swagger-ui-express');
var YAML = require('yamljs');
var swaggerJSON = YAML.load('./api/swagger/swagger.yaml');
const sqlite3 =  require('sqlite3').verbose();
const db = new sqlite3.Database('./server.db', sqlite3.OPEN_READWRITE, (error) => {
  if (error) {
    console.error('SQLite error', error);
  }else {
    console.log('Connected to SQLite');
  }
});

app.use(express.json());
app.use('/', swagger.serve);
app.get('/', swagger.setup(swaggerJSON));

app.get('/user', (req, res) => {
  var query = req.query;
  db.all(`SELECT * FROM user ${(query.limit)?'LIMIT '+query.limit:''} ${(query.offset)?'OFFSET '+query.offset:''};`, (err, rows) => {
    if (err === null) {
      res.status(200).send(rows);
    } else {
      console.error('SQLite3 Error: ', err);
      res.status(500).send({ message: 'Internal server error' });
    }
  });
});

app.get('/user/:id', (req, res) => {
  db.get('SELECT * FROM user WHERE id = ?;', [ req.params.id ], (err, row) => {
    if (err === null) {
      console.log(row);
      if (row === undefined) {
        res.status(404).send({ message: 'Object not found' });
      } else {
        res.status(200).send(row);
      }
    } else {
      console.error('SQLite3 Error: ', err);
      res.status(500).send({ message: 'Internal server error' });
    }
   });
});

app.post('/user', (req, res) => {
  db.run('INSERT INTO user(name, eval) VALUES (?, ?);', [ req.body.name, req.body.eval ], (err, row) => {
    console.log([err, row]);
    if (err === null) {
      res.status(200).send(true);
    } else {
      res.status(500).send(false);
    }
  });
});

app.patch('/user', (req, res) => {
  db.run('UPDATE user SET name = ?, eval = ? WHERE id = ?;', [ req.body.name, req.body.eval, req.body.id ], (err, row) => {
    if (err === null) {
      res.status(200).send(true);
    } else {
      res.status(500).send(false);
    }
  });
});

app.delete('/user/:id', (req, res) => {
  db.run('DELETE FROM user WHERE id = ?;', [ req.params.id ], (err, row) => {
    if (err === null) {
      res.status(200).send(true);
    } else {
      res.status(500).send(false);
    }
  })
});

app.get('**', (req, res) => {
  res.status(404).send({ message: 'Not foud' })
})

app.listen(3000, () => console.log("Server running on http://localhost:3000/ see swagger doc"));
