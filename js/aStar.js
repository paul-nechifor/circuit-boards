// Directions offsets for up, right, down, left.
DIR_OFFSET_X = new Int8Array([0, 1, 0, -1]);
DIR_OFFSET_Y = new Int8Array([-1, 0, 1, 0]);

function ANode(index, g, f, parent, dirParentTook) {
    this.index = index;
    this.g = g;
    this.f = f;
    this.parent = parent;
    this.dirParentTook = dirParentTook;
}

function aStar(partition, occupied, a, b, lenX, lenY) {
    var searchSet = constructSearchSet(partition, occupied);
    var start = new ANode(a, 0, 0, null, -1);
    var openSet = {};
    var nOpenSet = 0;
    
    var stopX = b % lenX;
    var stopY = (b / lenX) | 0;
    
    var best, bestNode, bestF, bestX, bestY;
    var next, nextNode, nextF;
    var i;
    var neig, neigX, neigY;
    var newG, newH, newNode;
    var otherH;
    
    // Adding the start node to the open set.
    openSet[a] = start;
    nOpenSet++;
    
    while (nOpenSet > 0) {
        
        // Extracting the best node out of the set.
        bestF = 999999999;
        for (next in openSet) {
            nextNode = openSet[next];
            nextF = nextNode.f;
            if (nextF < bestF) {
                bestF = nextF;
                bestNode = nextNode;
            }
        }
        best = bestNode.index;
        delete openSet[best];
        searchSet[best] = false;
        nOpenSet--;
        
        // If the solution was found, reconstruct the path and return it.
        if (best === b) {
            return reconstructAStarPath(bestNode);
        }
        
        // Compute the x and y for the best.
        bestX = best % lenX;
        bestY = (best / lenX) | 0;
        
        // For every neighbor.
        for (i = 0; i < 4; i++) {
            neigX = (bestX + DIR_OFFSET_X[i] + lenX) % lenX;
            neigY = (bestY + DIR_OFFSET_Y[i] + lenY) % lenY;
            neig = neigY * lenX + neigX;
            
            // If it is closed or it is pending in the openSet, skip it.
            if (!searchSet[neig] || openSet[neig]) {
                continue;
            }
            
            // Computing the Manhattan distance on a torus.
            // See: http://math.stackexchange.com/a/21707
            newH = Math.abs(neigX - stopX) + Math.abs(neigY - stopY);
            
            otherH = Math.abs(neigX + lenX - stopX) + Math.abs(neigY - stopY);
            if (otherH < newH) {
                newH = otherH;
            }
            
            otherH = Math.abs(neigX - stopX) + Math.abs(neigY + lenY - stopY);
            if (otherH < newH) {
                newH = otherH;
            }
            
            otherH = Math.abs(neigX + lenX - stopX) +
                    Math.abs(neigY + lenY - stopY);
            if (otherH < newH) {
                newH = otherH;
            }
            
            newG = bestNode.g + 1;
            newNode = new ANode(neig, newG, newG + newH, bestNode, i);
            openSet[neig] = newNode;
            nOpenSet++;
        }
    }
    
    // If path can't be found.
    return null;
}

function constructSearchSet(partition, occupied) {
    var searchSet = {};
    
    var cell;
    
    for (var i = 0, len = partition.length; i < len; i++) {
        cell = partition[i];
        
        if (occupied[cell] !== 1) {
            searchSet[cell] = true;
        }
    }
    
    return searchSet;
}

function reconstructAStarPath(destination) {
    var ret = [];
    var parent = destination;
    
    do {
        ret.push(parent.dirParentTook);
        parent = parent.parent;
    } while (parent.parent !== null);
    
    // Reverse the list (start position to destination).
    var len = ret.length;
    var mid = Math.floor(len / 2);
    var tmp;
    for (var i = 0; i < mid; i++) {
    	tmp = ret[len - i - 1];
    	ret[len - i - 1] = ret[i];
    	ret[i] = tmp;
    }
    
    return ret;
}