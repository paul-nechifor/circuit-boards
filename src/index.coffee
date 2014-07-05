exports.ChoicePool = require './ChoicePool'
exports.SmallHole = require './SmallHole'
exports.Square = require './Square'
exports.DrawBoard = require './DrawBoard'

exports.draw = (canvas, opts, cb) ->
  values = getDefaultValues opts.style
  for key, value of opts
    values[key] = value

  drawBoard = new exports.DrawBoard canvas, values, cb
  drawBoard.startDrawing()

  return (cb) ->
    drawBoard.stop cb

exports.styles = {}

addBasicStyle = (name, c) ->
  style =
    backgroundColor: c[0]
    circuitPrimaryColor: c[1]
    circuitSecondaryColor: c[2]
    fontColor: c[3]
  exports.styles[name] = style

addBasicStyle 'default', ['#112211', '#116611', '#666611', '#666611']
addBasicStyle 'yello-green', ['#02382b', '#c7b378', '#33dc4f', '#02dc51']
addBasicStyle 'old-style', ['#43282f', '#f0c866', '#654b30', '#d99a4b']
addBasicStyle 'dark-blue', ['#112154', '#94e1fd', '#e4edda', '#3a65c3']
addBasicStyle 'blue-yellow', ['#001e50', '#eaa428', '#f4eae9', '#85a2c2']

getDefaultValues = (style='default') ->
  connectionTypePool = new exports.ChoicePool
  connectionTypePool.addChoice 30, new exports.SmallHole
  connectionTypePool.addChoice 5, new exports.Square
  typePool = new exports.ChoicePool
  typePool.addChoice 15, 'connection'
  typePool.addChoice 1, 'text'

  values =
    connectionTypePool: connectionTypePool
    typePool: typePool
    size: 64
    abandonPartitionSize: 100
    partitionParamFunc: partitionParamFunc
    cellSize: 8
    squareRelativeSize: 0.7
    circuitPrimaryLineWidth: 0.26
    fontFamily: 'monospace'
    fontRelativeSize: 1.2

  for key, value of exports.styles[style]
    values[key] = value

  values

partitionParamFunc = (size) ->
  if size < 20
    [4, 5]
  else if size < 30
    [6, 7]
  else if size < 100
    [8, 6]
  else if size < 1000
    [10, 5]
  else
    [15, 4]
