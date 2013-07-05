///<reference path="Ball.ts"/>
///<reference path="Constants.ts"/>
///<reference path="GameObject.ts"/>
///<reference path="Physics.ts"/>

enum PlayerSide {
    Left,
    Right
}
enum PaddleState {
    Stationary,
    MovingUp,
    MovingDown
}

/*
 * class Paddle
 * ------------
 * 
 * Abstracts the Player and CPU paddles
 *
 * * stays within the arena 
 * * moves along the y axis
 * * if following a Ball, poorly follows the ball
 *
 */
class Paddle implements GameObject, PhysicalObject {
    public position: Vector2;
    public width: number = 8;
    public height: number = 64;
    private following: boolean = false;
    private target: Ball = null;

    private state: PaddleState = PaddleState.Stationary;

    constructor(
        private element: HTMLDivElement,
        private side: PlayerSide
    ) {
        this.element.style.position = 'absolute';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';

        this.reset();
    }

    private setPosition(newPosition: Vector2): void {
        this.position = newPosition;
        if (this.position.y <= this.height / 2) {
            this.position.y = this.height / 2;
        } else if (this.position.y >= HEIGHT - this.height / 2) {
            this.position.y = HEIGHT - this.height / 2;
        }
        this.element.style.top = Math.round(this.position.y - this.height / 2) + 'px';
        this.element.style.left = Math.round(this.position.x - this.width / 2) + 'px';
    }

    public reset(): void {
        this.setPosition(new Vector2(this.side == PlayerSide.Left ? PADDLE_OFFSET : WIDTH - PADDLE_OFFSET, HEIGHT / 2));
        this.state = PaddleState.Stationary;
    }

    /*
     * ### Movement controls
     */
    public goUp(): void {
        this.state = PaddleState.MovingUp;
    }
    public goDown(): void {
        this.state = PaddleState.MovingDown;
    }
    public releaseUp(): void {
        if (this.state == PaddleState.MovingUp) {
            this.state = PaddleState.Stationary;
        }
    }
    public releaseDown(): void {
        if (this.state == PaddleState.MovingDown) {
            this.state = PaddleState.Stationary;
        }
    }
    public stop(): void {
        this.state = PaddleState.Stationary;
    }

    /*
     * ### AI functions
     */
    public follow(ball: Ball): void {
        this.following = true;
        this.target = ball;
    }

    private updateAI(): void {
        if (   (this.target.position.x < this.position.x && this.target.velocity.x > 0)
            || (this.target.position.x > this.position.x && this.target.velocity.x < 0)) {
            // heading toward us
            if (Math.abs(this.target.position.y - this.position.y) < this.height / 4) {
                // close enough to target
                this.stop();
            } else if (this.state == PaddleState.Stationary) {
                if (this.position.y > this.target.position.y) {
                    this.goUp();
                } else {
                    this.goDown();
                }
            }
        } else {
            this.stop();
        }
    }

    /*
     * ### Update step
     */
    public update(timeDelta: number): void {
        if (this.following) {
            this.updateAI();
        }

        var dy = 0;
        switch (this.state) {
        case PaddleState.Stationary: dy = 0; break;
        case PaddleState.MovingUp: dy = -240; break;
        case PaddleState.MovingDown: dy = 240; break;
        }
        this.setPosition(new Vector2(this.position.x, (timeDelta * dy) + this.position.y));
    }
}

