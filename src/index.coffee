exports.ChoicePool = require './ChoicePool'
exports.SmallHole = require './SmallHole'
exports.Square = require './Square'
exports.DrawBoard = require './DrawBoard'

exports.draw = (canvas, opts, cb) ->
  values = getDefaultValues()
  for key, value of opts
    values[key] = value

  drawBoard = new exports.DrawBoard canvas, values, cb
  drawBoard.startDrawing()

  return (cb) ->
    drawBoard.stop cb

getDefaultValues = ->
  connectionTypePool = new exports.ChoicePool
  connectionTypePool.addChoice 30, new exports.SmallHole
  connectionTypePool.addChoice 5, new exports.Square
  typePool = new exports.ChoicePool
  typePool.addChoice 15, 'connection'
  typePool.addChoice 1, 'text'

  connectionTypePool: connectionTypePool
  typePool: typePool
  size: 64
  abandonPartitionSize: 100
  partitionParamFunc: partitionParamFunc
  cellSize: 8
  backgroundColor: '#112211'
  circuitPrimaryColor: '#116611'
  circuitSecondaryColor: '#666611'
  squareRelativeSize: 0.7
  circuitPrimaryLineWidth: 0.26
  fontColor: '#666611'
  fontFamily: 'monospace'
  fontRelativeSize: 1.2

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
