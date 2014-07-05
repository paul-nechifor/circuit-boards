function Element(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
}

Element.prototype.draw = function (ctx, values) {
    this.type.draw(ctx, values, this.x, this.y);
};

module.exports = Element;
