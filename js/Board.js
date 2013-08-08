function Board(lenX, lenY, abandonPartitionSize, partitionParamFunc,
        onNewConnection, onFinish) {
    this.lenX = lenX;
    this.lenY = lenY;
    
    // Partitions that have less cells than this will be eliminated.
    this.abandonPartitionSize = abandonPartitionSize;
    
    // For each partition size this should return an array of two numbers:
    // the minimum number of tries and the maximum number of failures.
    this.partitionParamFunc = partitionParamFunc;
    
    this.onNewConnection = onNewConnection;
    this.onFinish = onFinish;
    
    // This matrix tells if a point is occupied or not.
    this.occupied = new Uint8Array(lenX * lenY);
    this.nUnusedCells = lenX * lenY;
    
    // This is an array of partitions. Each partition is an array of numbers.
    // Each number represents a cell position (index of this.occupied).
    this.partitions = null;
    
    // If this is true, the filling stops. The onNewConnection callback might
    // request the stop.
    this.stop = false;
}

Board.prototype.doUntilFull = function () {
    var that = this;
    var next = function () {
        if (that.stop || that.nUnusedCells <= 0) {
            that.onFinish();
            return;
        }
        
        that.doPartitionsPass(next);
    };
    
    next();
};

Board.prototype.doPartitionsPass = function (onFinish) {
    var that = this;
    var i = 0;
    
    this.generatePartitions();
    
    if (this.partitions.length === 0) {
        onFinish();
        return;
    }
    
    var next = function () {
        var partition = that.partitions[i];
        that.doOnePartitionPass(partition, function () {
            i++;
            
            if (that.stop || i >= that.partitions.length) {
                onFinish();
                return;
            }
            
            setTimeout(next, 0);
        });
    };
    
    setTimeout(next, 0);
};

Board.prototype.doOnePartitionPass = function (partition, onFinish) {
    var cellsLeft = partition.length;
    
    if (cellsLeft <= this.abandonPartitionSize) {
        this.eliminatePartition(partition);
        onFinish();
        return;
    }
    
    var params = this.partitionParamFunc(partition.length);
    var minTries = params[0];
    var maxFailures = params[1];
    var tries = 0;
    var failures = 0;
    
    var eliminated;
    
    var that = this;
    var next = function () {
        var shouldContinue = tries <= minTries && failures <= maxFailures;
        if (!shouldContinue || that.stop) {
            onFinish();
            return;
        }
        
        eliminated = that.doOneTry(partition);
        
        tries++;
        
        if (eliminated === 0) {
            failures++;
        }
        
        cellsLeft -= eliminated;
        
        if (cellsLeft <= that.abandonPartitionSize) {
            that.eliminatePartition(partition);
            onFinish();
            return;
        }
        
        setTimeout(next, 0);
    };
    
    next();
};

/**
 * This tries to connect two random cells in the partition and returns the
 * number of cells that were eliminated. This function goes into an infinite
 * loop if the partition doesn't have free cells.
 */
Board.prototype.doOneTry = function (partition) {
    var a, b;
    var pIndex;
    var lenX = this.lenX;
    var lenY = this.lenY;
    
    // Choose one random free cell in this partition.
    do {
        pIndex = (Math.random() * partition.length) | 0;
        a = partition[pIndex];
    } while (this.occupied[a] === 1);
        
    // Choose a different random free cell in this partition.
    do {
        pIndex = (Math.random() * partition.length) | 0;
        b = partition[pIndex];
    } while (this.occupied[b] === 1 || a === b);
    
    var directions = aStar(partition, this.occupied, a, b, lenX, lenY);
    
    // If no path was found, no cells were eliminated.
    if (directions === null) {
        return 0;
    }
    
    this.eliminateUsedCells(a, directions);
    
    this.onNewConnection(
        a % lenX,
        (a / lenX) | 0,
        b % lenX,
        (b / lenX) | 0,
        directions
    );
    
    return 1 + directions.length;
};

Board.prototype.eliminateUsedCells = function (startCell, directions) {
    var lenX = this.lenX;
    var lenY = this.lenY;
    
    var cell;
    var cellX = startCell % lenX;
    var cellY = (startCell / lenX) | 0;
    
    var occupied = this.occupied;
    var dir;
    
    // Eliminate the start cell.
    occupied[startCell] = 1;
    this.nUnusedCells--;
    
    for (var i = 0, len = directions.length; i < len; i++) {
        dir = directions[i];
        
        cellX = (cellX + DIR_OFFSET_X[dir] + lenX) % lenX;
        cellY = (cellY + DIR_OFFSET_Y[dir] + lenY) % lenY;
        
        cell = cellY * lenX + cellX;
        
        occupied[cell] = 1;
        this.nUnusedCells--;
    }
};

/**
 * The partition is eliminated by filling all of its cells that it won't be
 * generated at the next partitions pass.
 */
Board.prototype.eliminatePartition = function (partition) {
    var occupied = this.occupied;
    var cell;
    
    for (var i = 0, len = partition.length; i < len; i++) {
        cell = partition[i];
        if (occupied[cell] !== 1) {
            occupied[cell] = 1;
            this.nUnusedCells--;
        }
    }
};

/**
 * Regenerate the partitions.
 */
Board.prototype.generatePartitions = function () {
    this.partitions = [];
    
    // A set of the free cells that haven't been used. (indices of occupied).
    var freeCells = {};
    var nFreeCells = 0;
    var startCell = -1;
    var partition;
    
    var i, len;
    
    // Generate the set of free cells.
    for (i = 0, len = this.occupied.length; i < len; i++) {
        if (this.occupied[i] === 0) {
            freeCells[i] = true;
            nFreeCells++;
        }
    }
    
    // While there still are unpartitioned free cells...
    while (nFreeCells > 0) {
        
        // Extract one cell (it doesn't matter which).
        for (startCell in freeCells) {
            break;
        }
        
        // Get all the cell that it can reach (that is, the partition).
        partition = this.extractPartition(startCell, freeCells);
        this.partitions.push(partition);
        
        nFreeCells -= partition.length;
    }
};

/**
 * Returns an array of cells that can be reached from the start point and
 * removes all those cells from freeCells.
 */
Board.prototype.extractPartition = function (startCell, freeCells) {
    var partition = [startCell];
    var index = 0;
    var lenX = this.lenX;
    var lenY = this.lenY;
    var cell, cellX, cellY;
    var neig, neigX, neigY;
    
    // Remove the start cell.
    delete freeCells[startCell];
    
    while (index < partition.length) {
        
        cell = partition[index];
        cellX = cell % lenX;
        cellY = (cell / lenX) | 0;
        
        // Checking top neighbor.
        neigY = (cellY - 1 + lenY) % lenY;
        neig = neigY * lenX + cellX;
        if (freeCells[neig]) {
            partition.push(neig);
            delete freeCells[neig];
        }
        
        // Checking bottom neighbor.
        neigY = (cellY + 1) % lenY;
        neig = neigY * lenX + cellX;
        if (freeCells[neig]) {
            partition.push(neig);
            delete freeCells[neig];
        }
        
        // Checking left neighbor.
        neigX = (cellX - 1 + lenX) % lenX;
        neig = cellY * lenX + neigX;
        if (freeCells[neig]) {
            partition.push(neig);
            delete freeCells[neig];
        }
        
        // Checking right neighbor.
        neigX = (cellX + 1) % lenX;
        neig = cellY * lenX + neigX;
        if (freeCells[neig]) {
            partition.push(neig);
            delete freeCells[neig];
        }
        
        index++;
    }
    
    return partition;
};

Board.prototype.getOccupiedString = function () {
    var ret = "";
    
    for (var i = 0, len = this.occupied.length; i < len; i++) {
        ret += this.occupied[i];
        if (i % this.lenX === this.lenX - 1) {
            ret += '\n';
        }
    }
    
    return ret;
};