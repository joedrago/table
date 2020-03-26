express = require 'express'
cookieParser = require 'cookie-parser'
fs = require 'fs'
Table = require './Table'

DEBUG_HACKS = false

randomString = ->
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

main = ->
  argv = process.argv.slice(2)
  if argv.length > 0
    console.log "Debug hacks enabled."
    DEBUG_HACKS = true

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
    if DEBUG_HACKS and req.query.__p
      pid = req.query.__p
      console.log "Allowing hack pid: #{pid}"
    res.cookie('id', pid)

    tid = req.query.t
    if not tid?
      tid = randomString()
      res.redirect("/?t=#{tid}")
      return

    html = fs.readFileSync("#{__dirname}/../web/client.html", "utf8")
    html = html.replace(/!PLAYERID!/, pid)
    html = html.replace(/!TABLEID!/, tid)
    res.send(html)

  app.use(express.static('web'))

  http.listen 3000, ->
    console.log('listening on *:3000')

module.exports = main
