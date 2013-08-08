$(document).ready(function () {
    main();
});

function main() {
    var page = new Page();
    page.setup();
}

function Page() {
    this.regenerateBtn = $('#regenerate');
    this.setAsBackgroundBtn = $('#set-as-background');
    this.values = document.getElementById('values');
    this.drawBoard = null;
    this.isBackgroundSet = false;
}

Page.prototype.setup = function () {
    var that = this;
    
    this.regenerateBtn.click(function () {
        that.onRegenerateClick();
    });
    
    this.setAsBackgroundBtn.click(function () {
        that.onSetAsBackgroundClick();
    });
    
    that.generateNewBoard();
};

Page.prototype.onRegenerateClick = function () {
    var that = this;
    
    if (this.drawBoard === null || this.drawBoard.finished) {
        this.generateNewBoard();
    } else {
        this.drawBoard.stop(function () {
            that.generateNewBoard();
        });
    }
}

Page.prototype.onSetAsBackgroundClick = function () {
    this.isBackgroundSet = !this.isBackgroundSet;
    
    if (this.isBackgroundSet) {
        $('body').addClass('circuit');
        document.body.style.backgroundImage =
                "url(" + this.drawBoard.canvas.toDataURL("image/png") + ")";
            
        var that = this;
        var x = 0;
        var move = function () {
            if (!that.isBackgroundSet) {
                return;
            }
            x += 2;
            document.body.style.backgroundPositionX = x + 'px';
            
            setTimeout(move, 20);
        };
        
        move();
    } else {
        $('body').removeClass('circuit');
        document.body.style.backgroundImage = "none";
    }
};

Page.prototype.generateNewBoard = function () {
    this.drawBoard = new DrawBoard(getInputValues());
    this.drawBoard.startDrawing();
};

function getInputValues() {
    var choicePool = new ChoicePool();
    choicePool.addChoice(30, new SmallHole());
    choicePool.addChoice(5, new Square());
    
    var values = JSON.parse(this.values.value);
    
    values.canvas = document.getElementById("tile");
    values.choicePool = choicePool;
    values.partitionParamFunc = partitionParamFunc;
    
    return values;
}

function partitionParamFunc(size) {
    if (size < 20) {
        return [4, 5];
    } else if (size < 30) {
        return [6, 7];
    } else if (size < 100) {
        return [8, 6];
    } else if (size < 1000) {
        return [10, 5];
    } else {
        return [15, 4];
    }
}