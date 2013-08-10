function DrawBoard(values) {
    this.values = values;
    this.size = values.size * values.cellSize;
    this.canvas = values.canvas;
    this.canvas.width = values.size * values.cellSize;
    this.canvas.height = values.size * values.cellSize;
    this.ctx = this.canvas.getContext('2d');
    
    this.elements = [];
    this.lines = [];
    this.texts = [];
    this.lastDrawn = 0;
    this.finished = false;
    
    var that = this;
    
    var onFinish = function () {
        that.finished = true;
        that.redraw();
    };
    
    var fontSize = this.values.cellSize * this.values.fontRelativeSize;
    this.ctx.font = fontSize + 'px ' + this.values.fontFamily;
    
    var cellsForText = function (text) {
        return Math.ceil(that.ctx.measureText(text).width / values.cellSize);
    };
    
    this.board = new Board(
        values.size,
        values.size,
        values.abandonPartitionSize,
        values.partitionParamFunc,
        values.typePool,
        cellsForText,
        this.addNewThing.bind(this),
        onFinish);
}

DrawBoard.prototype.startDrawing = function () {   
    this.board.doUntilFull();
};

DrawBoard.prototype.stop = function (callback) {
    var that = this;
    
    this.board.onFinish = function () {
        that.finished = true;
        callback();
    };
    
    this.board.stop = true;
};

DrawBoard.prototype.redraw = function () {
    this.ctx.fillStyle = this.values.backgroundColor;
    this.ctx.fillRect(0, 0, this.size, this.size);
    
    var i, len;
    
    for (i = 0, len = this.lines.length; i < len; i++) {
        this.lines[i].draw(this.ctx, this.values);
    }
    
    for (i = 0, len = this.elements.length; i < len; i++) {
        this.elements[i].draw(this.ctx, this.values);
    }
    
    for (i = 0, len = this.texts.length; i < len; i++) {
        this.texts[i].draw(this.ctx, this.values);
    }
};

DrawBoard.prototype.addNewThing = function (t) {
    if (t.type === 'connection') {
        this.addConnection(t.sx, t.sy, t.tx, t.ty, t.directions);
    } else if (t.type === 'text') {
        this.addText(t.sx, t.sy, t.text, t.nCells);
    }
    
    if (Date.now() - this.lastDrawn > 100) {
        this.redraw();
        this.lastDrawn = Date.now();
    }
};

DrawBoard.prototype.addConnection = function (sx, sy, tx, ty, directions) {
    var type = this.values.connectionTypePool.pick();
    
    this.elements.push(new Element(type, sx, sy));
    this.elements.push(new Element(type, tx, ty));
    
    this.lines.push(new Line(sx, sy, directions));
};

DrawBoard.prototype.addText = function (sx, sy, text, nCells) {
    this.texts.push(new Text(sx, sy, text, nCells));
};