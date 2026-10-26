class Block{
    constructor(x, y, width, height, colour) {
        var options = {
            restitution :0.4,
            friction :0.0
        }
        this.body = Bodies.rectangle(x, y, width, height, options);
        this.width = width;
        this.height = height;
        this.colour = colour;
        this.removed = false;
        this.visibility = 255;
        World.add(world, this.body);
      }

      // Returns the points earned this frame (only once, when the block is knocked out)
      score(){
        if(this.removed && !this.counted){
          this.counted = true;
          return 10;
        }
        return 0;
      }

      display(){
        var pos = this.body.position;
        var angle = this.body.angle;

        // A block that gets hit hard enough is knocked out of the world
        if(!this.removed && this.body.speed >= 3){
          World.remove(world, this.body);
          this.removed = true;
        }

        // Knocked-out blocks fade away instead of vanishing instantly
        if(this.removed){
          this.visibility = this.visibility - 5;
          if(this.visibility <= 0) return;
        }

        push();
        translate(pos.x, pos.y);
        rotate(angle);
        rectMode(CENTER);
        var c = color(this.colour);
        c.setAlpha(this.visibility);
        fill(c);
        rect(0, 0, this.width, this.height);
        pop();
      }
}
