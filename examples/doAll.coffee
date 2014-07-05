Canvas = require 'canvas'
circuits = require '../lib'
fs = require 'fs'

main = ->
  doStyles Object.keys(circuits.styles), ->
    console.log 'done'

doStyles = (names, cb) ->
  i = 0
  next = ->
    return cb() if i >= names.length
    doStyle names[i], (err) ->
      return cb err if err
      i++
      next()
  next()

doStyle = (name, cb) ->
  canvas = new Canvas
  circuits.draw canvas, {style: name}, ->
    out = fs.createWriteStream "#{__dirname}/images/#{name}.png"
    stream = canvas.pngStream()
    stream.on 'data', (chunk) -> out.write chunk
    stream.on 'end', cb

main()
