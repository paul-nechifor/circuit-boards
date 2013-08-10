function Text(sx, sy, text, nCells) {
    this.sx = sx;
    this.sy = sy;
    this.text = text;
    this.nCells = nCells;
}

Text.prototype.draw = function (ctx, values) {
    var cs = values.cellSize;
    var x, y;
    
    ctx.fillStyle = values.fontColor;
    
    // To align the text in the center of the cells used;
    var xAdvance = (cs * this.nCells - ctx.measureText(this.text).width) / 2;
    console.log(xAdvance);
    
    for (var bx = -1; bx <= 1; bx++) {
    	for (var by = -1; by <= 1; by++) {
    	    x = values.size * bx + this.sx;
    	    y = values.size * by + this.sy;
            
            ctx.fillText(this.text, xAdvance + x * cs, (y + 1) * cs);
    	}
    }
};