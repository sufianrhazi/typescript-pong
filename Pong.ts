/*
 * Helper Functions 
 * ================
 *
 * ### startLoop: (loop: (timeDelta: number) => void) => () => void
 * 
 * Calls the `loop` function every frame with `timeDelta` equal to the number of seconds that have passed since the last frame.
 * 
 * Returns a function that, when called, stops the loop.
 */
function startLoop(loop: (timeDelta: number) => void): () => void {
    var lastFrame: Date = null;
    var handle: number = null;

    function nextFrame() {
        var now: Date = new Date();
        var timeDelta: number;
        if (lastFrame == null) {
            timeDelta = 0;
        } else {
            timeDelta = (now.getTime() - lastFrame.getTime()) / 1000;
        }
        lastFrame = now;
        loop(timeDelta);
        handle = requestAnimationFrame(nextFrame);
    }
    handle = requestAnimationFrame(nextFrame);

    function stopLoop(): void {
        cancelAnimationFrame(handle);
    }
    return stopLoop;
}

/*
 * ### createDiv: (container: HTMLElement, className: string) => HTMLDivElement
 * 
 * Create a new `<div>` element that has class=`className` and is a child of `contiainer`.
 */
function createDiv(container: HTMLElement, className: string): HTMLDivElement {
    var el = document.createElement('div');
    el.className = className;
    container.appendChild(el);
    return el;
}


/*
 * Constants
 * =========
 */
var WIDTH = 640;
var HEIGHT = 480;
var PADDLE_OFFSET = 16;


/*
 * Keyboard Handling
 * =================
 */

interface KeyboardHandler {
    onKeyDown: (keyCode: number) => void;
    onKeyUp: (keyCode: number) => void;
}

class KeyboardDelegate {
    private handlers: Array<KeyboardHandler> = [];

    constructor() {
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            this.handlers.forEach((handler) => handler.onKeyDown(event.keyCode));
        });
        document.addEventListener('keyup', (event: KeyboardEvent) => {
            this.handlers.forEach((handler) => handler.onKeyUp(event.keyCode));
        });
    }

    public addHandler(handler: KeyboardHandler) {
        this.handlers.push(handler);
    }
}


/*
 * Physics
 * =======
 */
class Vector2 {
    constructor(
        public x: number,
        public y: number
    ) {}

    public add(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    public difference(v: Vector2): Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    public scale(n: number): Vector2 {
        return new Vector2(this.x * n, this.y * n);
    }

    public amplitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public static reflectX(point: Vector2, x: number) {
        return new Vector2(2 * x - point.x, point.y);
    }

    public static reflectY(point: Vector2, y: number) {
        return new Vector2(point.x, 2 * y - point.y);
    }
}

interface PhysicalObject {
    position: Vector2;
    width: number;
    height: number;
}

function isInside(obstruction: PhysicalObject, point: Vector2): boolean {
    var difference = obstruction.position.difference(point);
    return Math.abs(difference.x) < obstruction.width/2 && Math.abs(difference.y) < obstruction.height/2;
}
function isOverlap(o1: PhysicalObject, o2: PhysicalObject): boolean {
    var difference = o1.position.difference(o2.position);
    return Math.abs(difference.x) < o1.width/2 + o2.width/2 && Math.abs(difference.y) < o1.height/2 + o2.height/2;
}


/*
 * Game Objects
 * ============
 *
 * interface GameObject
 * --------------------
 *
 * A unit in the game that is updated every frame
 *
 */
interface GameObject {
    update(timeSinceLastFrame: number): void;
}

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
        var amplitude = 250;
        this.velocity = new Vector2(
            (Math.random() > 0.5 ? 1 : -1) * Math.cos(angle) * amplitude,
            Math.sin(angle) * amplitude
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


/*
 * class GameAudio
 * ===============
 *
 * The sound effect manager
 *
 */
class GameAudio {
    private audioContext: any; // AudioContext not declared
    private gain: any; // GainNode not declared
    private oscillator: any; // OscillatorNode not declared

    constructor() {
        if ('webkitAudioContext' in window) {
            this.audioContext = new (<any>window).webkitAudioContext();
            this.gain = this.audioContext.createGainNode();
            this.oscillator = this.audioContext.createOscillator();
            this.gain.connect(this.audioContext.destination);
            this.oscillator.connect(this.gain);
            this.gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime);
            this.oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
            this.oscillator.noteOn(this.audioContext.currentTime);
        }
    }

    public playBallOut(): void {
        if (this.audioContext) {
            this.oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
            this.oscillator.frequency.linearRampToValueAtTime(440, this.audioContext.currentTime + 0.10);
            this.oscillator.frequency.linearRampToValueAtTime(220, this.audioContext.currentTime + 0.35);
            this.gain.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.10);
            this.gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.35);
        }
    }

    public playPing(): void {
        if (this.audioContext) {
            this.oscillator.frequency.setValueAtTime(220 + Math.random() * 660, this.audioContext.currentTime);
            this.gain.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.10);
            this.gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.20);
        }
    }
}

/*
 * class Score
 * ===========
 *
 * Holds and displays a player's score
 *
 */
class Score {
    private score: number = 0;
    constructor(
        private element: HTMLDivElement
    ) {
        this.updateElement();
    }

    public inc(): void {
        this.score += 1;
        this.updateElement();
    }

    private updateElement(): void {
        while (this.element.childNodes.length > 0) {
            this.element.removeChild(this.element.childNodes[0]);
        }
        this.element.appendChild(document.createTextNode(this.score.toString()));
    }
}

/*
 * The Game
 * ========
 *
 */
enum GameState {
    Reset,
    Ready,
    Playing
}

class Game implements KeyboardHandler {
    private state: GameState = GameState.Reset;

    private player: Paddle;
    private cpu: Paddle;
    private ball: Ball;
    private playerScore: Score;
    private cpuScore: Score;
    private audio: GameAudio;
    private startEl: HTMLDivElement;
    private objects: Array<GameObject>;
    private stopRenderLoop: () => void = () => {};

    constructor(
        private container: HTMLDivElement
    ) {
        this.audio = new GameAudio();

        this.container.style.position = 'relative';
        this.container.style.width = WIDTH + 'px';
        this.container.style.height = HEIGHT + 'px';

        this.startEl = createDiv(container, 'start');
        this.startEl.appendChild(document.createTextNode('Press Spacebar'));

        this.playerScore = new Score(createDiv(container, 'score player'));
        this.cpuScore = new Score(createDiv(container, 'score cpu'));

        this.player = new Paddle(createDiv(container, 'paddle'), PlayerSide.Left);
        this.cpu = new Paddle(createDiv(container, 'paddle'), PlayerSide.Right);
        this.ball = new Ball(createDiv(container, 'ball'), [this.player, this.cpu], this.onBallOut.bind(this), this.audio.playPing.bind(this.audio));
        this.cpu.follow(this.ball);

        this.objects = [ this.player, this.cpu, this.ball ];
    }

    public reset(): void {
        this.stopRenderLoop();
        this.ball.reset();
        this.player.reset();
        this.cpu.reset();
        this.startEl.style.display = 'block';
        this.state = GameState.Ready;
    }

    private startGame() {
        this.stopRenderLoop = startLoop((timeDelta: number): void => {
            this.objects.forEach((go: GameObject) => {
                go.update(timeDelta);
            });
        });

        this.startEl.style.display = 'none';
        this.state = GameState.Playing;
        this.ball.launch();
    }

    private onBallOut(): void {
        this.audio.playBallOut();

        if (this.ball.position.x < WIDTH / 2) {
            this.cpuScore.inc();
        } else {
            this.playerScore.inc();
        }
        this.reset();
    }

    public onKeyDown(keyCode: number): void {
        if (this.state == GameState.Playing) {
            if (keyCode == 38) this.player.goUp();
            if (keyCode == 40) this.player.goDown();
        }
        if (this.state == GameState.Ready) {
            if (keyCode == 32) this.startGame();
        }
    }

    public onKeyUp(keyCode: number): void {
        if (this.state == GameState.Playing) {
            if (keyCode == 38) this.player.releaseUp();
            if (keyCode == 40) this.player.releaseDown();
        }
    }
}

var keyboardDelegate = new KeyboardDelegate();
var game: Game = new Game(<HTMLDivElement>document.getElementById('pong'));
keyboardDelegate.addHandler(game);
game.reset();
