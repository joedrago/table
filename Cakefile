browserify = require 'browserify'
coffeeify = require 'coffeeify'
uglifyify = require 'uglifyify'

fs = require 'fs'
path = require 'path'
{spawn} = require 'child_process'
util = require 'util'
watch = require 'node-watch'

coffeeName = 'coffee'
if process.platform == 'win32'
  coffeeName += '.cmd'

buildBundle = (uiSrc, uiDst, callback) ->
  # equal of command line $ "browserify --debug -t coffeeify ./src/main.coffee > bundle.js "
  productionBuild = (process.env.NODE_ENV == 'production')
  opts = {
    extensions: ['.coffee']
  }
  if not productionBuild
    opts.debug = true
  b = browserify opts
  b.add uiSrc
  b.transform coffeeify
  if productionBuild
    b.transform { global: true, ignore: ['**/main.*'] }, uglifyify
  b.bundle (err, result) ->
    if not err
      fs.writeFile uiDst, result, (err) ->
        if not err
          util.log "Client compilation finished: #{uiDst}"
          callback?()
        else
          util.log "Client bundle write failed: " + err
    else
      util.log "Client compilation failed: " + err

buildClient = (callback) ->
  buildBundle('./src/client/client.coffee', "web/client.js", callback)

buildServer = (callback) ->
  coffee = spawn coffeeName, ['-c', '-o', 'server', 'src/server']
  coffee.stderr.on 'data', (data) ->
    process.stderr.write data.toString()
    process.exit(-1)
  coffee.stdout.on 'data', (data) ->
    print data.toString()
  coffee.on 'exit', (code) ->
    util.log "Server compilation finished."
    callback?() if code is 0

buildEverything = ->
  buildServer ->
    buildClient ->

task 'build', 'build JS bundle', (options) ->
  buildEverything()

watchEverything = ->
  util.log "Watching for changes in src"
  watch ['src/client','src/server','package.json'], (evt, filename) ->
    coffeeFileRegex = /\.coffee$/
    if coffeeFileRegex.test(filename) || (filename == 'package.json')
      util.log "Source code #{filename} changed."
      util.log "Regenerating..."
      buildEverything()
  buildEverything()

task 'watch', 'watch everything', (options) ->
  watchEverything()
