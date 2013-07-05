///<reference path="Constants.ts"/>
///<reference path="GameObject.ts"/>
///<reference path="Physics.ts"/>

/*
 * class Ball
 * ------------
 * 
 * * reflects off arena top/bottom
 * * reflects off obstructions
 * * triggers onCollide when collides with anything
 * * triggers onOut when leaves the arena
 *
 */
class Ball implements GameObject, PhysicalObject {
    public position: Vector2;
    public velocity: Vector2;
    public width: number = 4;
    public height: number = 4;

    constructor(
        private element: HTMLDivElement,
        private obstructions: Array<PhysicalObject>,
        private onOut: () => void,
        private onCollide: () => void
    ) {
        this.element.style.position = 'absolute';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';

        this.reset();
    }

    public reset(): void {
        this.position = new Vector2(WIDTH / 2, HEIGHT / 2);
        this.velocity = new Vector2(0, 0);
    }

    public launch(): void {
        var angle = (Math.random() * Math.PI/2) - Math.PI/4;
        this.velocity = new Vector2(
            (Math.random() > 0.5 ? 1 : -1) * Math.cos(angle) * 250,
            Math.sin(angle) * 250
        );
    }

    private setPosition(position: Vector2): void {
        this.position = position;
        this.element.style.left = Math.round(this.position.x) + 'px';
        this.element.style.top = Math.round(this.position.y) + 'px';
    }

    public update(timeDelta: number): void {
        var nextPosition = this.position.add(this.velocity.scale(timeDelta));
        var verticalHit = (reflectY: number): void => {
        };

        if (this.velocity.y < 0 && nextPosition.y - this.height/2 < 0) {
            // reflected off top
            nextPosition = Vector2.reflectY(nextPosition, 0);
            this.velocity.y = -this.velocity.y;
            this.onCollide();
        }
        if (this.velocity.y > 0 && nextPosition.y + this.height/2 > HEIGHT - 1) {
            // reflected off bottom
            nextPosition = Vector2.reflectY(nextPosition, HEIGHT - 1);
            this.velocity.y = -this.velocity.y;
            this.onCollide();
        }

        var nextObject: PhysicalObject = {
            position: nextPosition,
            width: this.width,
            height: this.height
        };

        // Paddle hit
        this.obstructions.forEach((obstruction) => {
            var isHit: boolean = isOverlap(obstruction, nextObject);
            if (this.velocity.x < 0 && obstruction.position.x < this.position.x && isHit) {
                // The right side of the obstruction hit the ball
                nextPosition = Vector2.reflectX(nextPosition, obstruction.position.x + obstruction.width/2);
                var amplitude = this.velocity.amplitude() + 25;
                var angle = Math.random() * Math.PI/2 - Math.PI/4;
                this.velocity = new Vector2(Math.cos(angle) * amplitude, Math.sin(angle) * amplitude);
                this.onCollide();
            }
            if (this.velocity.x > 0 && obstruction.position.x > this.position.x && isHit) {
                // The left side of the obstruction hit the ball
                nextPosition = Vector2.reflectX(nextPosition, obstruction.position.x - obstruction.width/2);
                var amplitude = this.velocity.amplitude() + 25;
                var angle = Math.PI + (Math.random() * Math.PI/2 - Math.PI/4);
                this.velocity = new Vector2(Math.cos(angle) * amplitude, Math.sin(angle) * amplitude);
                this.onCollide();
            }
        });

        this.setPosition(nextPosition);

        if (this.position.x < 0 || this.position.x >= WIDTH) {
            this.onOut();
        }
    }
}


