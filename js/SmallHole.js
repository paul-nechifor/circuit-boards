function SmallHole() {
}

SmallHole.prototype.draw = function (ctx, values, x, y) {
    var cs = values.cellSize;
    var radius = cs * (1 / 3.3);
    var width = cs * (1 / 3.4);
        
    ctx.beginPath();
    ctx.arc((x+0.5)*cs, (y+0.5)*cs, radius, 0, Math.PI*2, true);
    ctx.strokeStyle = values.circuitPrimaryColor;
    ctx.fillStyle = values.backgroundColor;
    ctx.lineWidth = width;
    ctx.fill();
    ctx.stroke();
};