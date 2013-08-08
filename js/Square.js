function Square() {
}

Square.prototype.draw = function (ctx, values, x, y) {
    var cs = values.cellSize;
    var relative = values.squareRelativeSize;
    var totalX = cs;
    var totalY = cs;
    var relX = totalX * relative;
    var relY = totalY * relative;
    var offsetX = x * cs + (totalX - relX) / 2;
    var offsetY = y * cs + (totalY - relY) / 2;
    
    ctx.fillStyle = values.circuitSecondaryColor;
    ctx.fillRect(offsetX, offsetY, relX, relY);
};