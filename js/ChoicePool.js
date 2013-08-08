function ChoicePool() {
    this.weights = [];
    this.choices = [];
    this.sum = 0;
}

ChoicePool.prototype.addChoice = function (weight, choice) {
    this.weights.push(weight);
    this.choices.push(choice);
    this.sum += weight;
};

ChoicePool.prototype.pick = function () {
    var r = Math.floor(Math.random() * this.sum) + 1;
    var runningSum = 0;
    
    for (var i = 0, len = this.weights.length; i < len; i++) {
        runningSum += this.weights[i];
        if (runningSum >= r) {
            return this.choices[i];
        }
    }
    
    return null; // Impossible.
};