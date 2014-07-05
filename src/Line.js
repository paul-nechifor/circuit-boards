function Line(startX, startY, path) {
    this.startX = startX;
    this.startY = startY;
    this.path = path;
}

Line.prototype.draw = function (ctx, values) {
    var cs = values.cellSize;
    var x, y, dir;

    for (var bx = -1; bx <= 1; bx++) {
    	for (var by = -1; by <= 1; by++) {
    	    x = values.size * bx + this.startX;
    	    y = values.size * by + this.startY;

    	    ctx.beginPath();
    	    ctx.moveTo((x+0.5) * cs, (y+0.5) * cs);

    	    for (var i = 0, len = this.path.length; i < len; i++) {
    	        dir = this.path[i];
    	        x += DIR_OFFSET_X[dir];
    	        y += DIR_OFFSET_Y[dir];
    	        ctx.lineTo((x+0.5) * cs, (y+0.5) * cs);
    	    }

    	    ctx.strokeStyle = values.circuitPrimaryColor;
    	    ctx.lineWidth = cs * values.circuitPrimaryLineWidth;
    	    ctx.stroke();
    	}
    }
};

module.exports = Line;
