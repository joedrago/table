// Generated by CoffeeScript 2.5.1
(function() {
  var DEBUG_HACKS, Table, cookieParser, express, fs, main, randomString;

  express = require('express');

  cookieParser = require('cookie-parser');

  fs = require('fs');

  Table = require('./Table');

  DEBUG_HACKS = false;

  randomString = function() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  main = function() {
    var app, argv, http, io, socketInfo, tables;
    argv = process.argv.slice(2);
    if (argv.length > 0) {
      console.log("Debug hacks enabled.");
      DEBUG_HACKS = true;
    }
    tables = {};
    socketInfo = {};
    app = express();
    http = require('http').createServer(app);
    io = require('socket.io')(http);
    io.on('connection', function(socket) {
      socket.on('here', function(msg) {
        if ((msg.pid == null) || (msg.tid == null)) {
          console.error("ERROR: Bad 'here' message, ignoring");
          return;
        }
        if (tables[msg.tid] == null) {
          tables[msg.tid] = new Table(msg.tid);
        }
        tables[msg.tid].playerConnect(msg.pid, socket);
        return socketInfo[socket.id] = {
          pid: msg.pid,
          table: tables[msg.tid]
        };
      });
      socket.on('disconnect', function() {
        var info;
        if (socketInfo[socket.id] != null) {
          info = socketInfo[socket.id];
          info.table.playerDisconnect(info.pid);
          return delete socketInfo[socket.id];
        }
      });
      return socket.on('table', function(msg) {
        if ((msg.pid == null) || (msg.tid == null)) {
          console.error("ERROR: Bad 'here' message, ignoring");
          return;
        }
        if (socketInfo[socket.id] == null) {
          return;
        }
        if (tables[msg.tid] == null) {
          return;
        }
        if (msg.type == null) {
          return;
        }
        return tables[msg.tid].msg(msg);
      });
    });
    app.use(cookieParser());
    app.get('/', function(req, res) {
      var html, pid, tid;
      pid = req.cookies.id;
      if (pid == null) {
        pid = randomString();
      }
      if (DEBUG_HACKS && req.query.__p) {
        pid = req.query.__p;
        console.log(`Allowing hack pid: ${pid}`);
      }
      res.cookie('id', pid);
      tid = req.query.t;
      if (tid == null) {
        tid = randomString();
        res.redirect(`/?t=${tid}`);
        return;
      }
      html = fs.readFileSync(`${__dirname}/../web/client.html`, "utf8");
      html = html.replace(/!PLAYERID!/, pid);
      html = html.replace(/!TABLEID!/, tid);
      return res.send(html);
    });
    app.use(express.static('web'));
    return http.listen(3000, function() {
      return console.log('listening on *:3000');
    });
  };

  module.exports = main;

}).call(this);
