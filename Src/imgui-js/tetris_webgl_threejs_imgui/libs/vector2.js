//
// 2D vector
//

Vector2 = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;    
}

Vector2.prototype = {

    constructor: Vector2,

    set: function (x, y) {
        this.x = x;
        this.y = y;
    },

    copy: function (v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    },

};
