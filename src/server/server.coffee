express = require 'express'
cookieParser = require 'cookie-parser'
fs = require 'fs'
Table = require './Table'

randomString = ->
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

main = ->
  tables = {}
  socketInfo = {}

  app = express()
  http = require('http').createServer(app)

  io = require('socket.io')(http)
  io.on 'connection', (socket) ->
    socket.on 'here', (msg) ->
      if not msg.pid? or not msg.tid?
        console.error "ERROR: Bad 'here' message, ignoring"
        return
      if not tables[msg.tid]?
        tables[msg.tid] = new Table(msg.tid)
      tables[msg.tid].playerConnect(msg.pid, socket)
      socketInfo[socket.id] = {
        pid: msg.pid
        table: tables[msg.tid]
      }

    socket.on 'disconnect', ->
      if socketInfo[socket.id]?
        info = socketInfo[socket.id]
        info.table.playerDisconnect(info.pid)
        delete socketInfo[socket.id]

    socket.on 'table', (msg) ->
      if not msg.pid? or not msg.tid?
        console.error "ERROR: Bad 'here' message, ignoring"
        return
      if not socketInfo[socket.id]?
        return
      if not tables[msg.tid]?
        return
      if not msg.type?
        return
      tables[msg.tid].msg(msg)

  app.use(cookieParser())
  app.get '/', (req, res) ->
    pid = req.cookies.id
    if not pid?
      pid = randomString()
    res.cookie('id', pid)

    tid = req.query.t
    if not tid?
      tid = randomString()
      res.redirect("/?t=#{tid}")
      return

    html = fs.readFileSync("#{__dirname}/../web/index.html", "utf8")
    html = html.replace(/!PLAYERID!/, pid)
    html = html.replace(/!TABLEID!/, tid)
    res.send(html)

  app.use(express.static('web'))

  http.listen 3000, ->
    console.log('listening on *:3000')

module.exports = main
