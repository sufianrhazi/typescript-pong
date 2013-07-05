function startLoop(loop: (number) => void): void {
    var time: Date = new Date();
    function nextFrame() {
        var now: Date = new Date();
        var timeDelta: number = (now.getTime() - time.getTime()) / 1000;
        time = now;
        loop(timeDelta);
        requestAnimationFrame(nextFrame);
    }
    requestAnimationFrame(nextFrame);
}

function createDiv(container: HTMLElement, className: string): HTMLDivElement {
    var el = document.createElement('div');
    el.className = className;
    container.appendChild(el);
    return el;
}

var WIDTH = 640;
var HEIGHT = 480;
var PADDLE_OFFSET = 16;

class Vector2 {
    constructor(public x: number, public y: number) {}
    public add(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }
    public difference(v: Vector2): Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }
    public scale(n: number): Vector2 {
        return new Vector2(this.x * n, this.y * n);
    }
    public static reflectX(point: Vector2, x: number) {
        return new Vector2(2 * x - point.x, point.y);
    }
    public static reflectY(point: Vector2, y: number) {
        return new Vector2(point.x, 2 * y - point.y);
    }
}

interface Obstruction {
    position: Vector2;
    width: number;
    height: number;
}
function isInside(obstruction: Obstruction, point: Vector2): boolean {
    var difference = obstruction.position.difference(point);
    return Math.abs(difference.x) < obstruction.width/2 && Math.abs(difference.y) < obstruction.height/2;
}
function isOverlap(o1: Obstruction, o2: Obstruction): boolean {
    var difference = o1.position.difference(o2.position);
    return Math.abs(difference.x) < o1.width/2 + o2.width/2 && Math.abs(difference.y) < o1.height/2 + o2.height/2;
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

interface GameObject {
    update(timeSinceLastFrame: number): void;
}

class Paddle implements GameObject, Obstruction {
    public position: Vector2;
    public width: number = 8;
    public height: number = 64;
    private following: boolean = false;
    private target: Ball = null;

    private state: PaddleState = PaddleState.Stationary;
    goUp(): void {
        this.state = PaddleState.MovingUp;
    }
    goDown(): void {
        this.state = PaddleState.MovingDown;
    }
    releaseUp(): void {
        if (this.state == PaddleState.MovingUp) {
            this.state = PaddleState.Stationary;
        }
    }
    releaseDown(): void {
        if (this.state == PaddleState.MovingDown) {
            this.state = PaddleState.Stationary;
        }
    }
    stop(): void {
        this.state = PaddleState.Stationary;
    }

    follow(ball: Ball): void {
        this.following = true;
        this.target = ball;
    }

    constructor(private element: HTMLDivElement, private side: PlayerSide) {
        this.element.style.position = 'absolute';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';

        this.element.style.position = 'absolute';

        this.reset();
    }

    public reset(): void {
        this.setPosition(new Vector2(this.side == PlayerSide.Left ? PADDLE_OFFSET : WIDTH - PADDLE_OFFSET, HEIGHT / 2));
        this.state = PaddleState.Stationary;
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

    public update(timeDelta: number): void {
        if (this.following) {
            if (   (this.target.position.x < this.position.x && this.target.velocity.x > 0)
                || (this.target.position.x > this.position.x && this.target.velocity.x < 0)) {
                if (this.target.position.y < this.position.y - this.height / 2) {
                    this.goUp();
                } else if (this.target.position.y > this.position.y + this.height / 2) {
                    this.goDown();
                } else if (this.state != PaddleState.Stationary && Math.abs(this.target.position.y - this.position.y) < this.height / 4) {
                    this.stop();
                }
            }
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

class Ball implements GameObject, Obstruction {
    public position: Vector2;
    public velocity: Vector2;
    public width: number = 4;
    public height: number = 4;
    private onOutHandler: () => void;
    private onCollideHandler: () => void;

    constructor(private element: HTMLDivElement, private obstructions: Array<Obstruction>) {
        this.element.style.position = 'absolute';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';

        this.position = new Vector2(WIDTH / 2, HEIGHT / 2);
        this.velocity = new Vector2(0, 0);
    }

    private updateElement(): void {
        this.element.style.left = Math.round(this.position.x) + 'px';
        this.element.style.top = Math.round(this.position.y) + 'px';
    }

    private setVelocity(dx: number, dy: number): void {
        this.velocity.x = dx;
        this.velocity.y = dx;
    }

    public update(timeDelta: number): void {
        var nextPosition = this.position.add(this.velocity.scale(timeDelta));

        // Arena out-of-bounds
        if (this.velocity.y < 0 && nextPosition.y - this.height/2 < 0) {
            nextPosition = Vector2.reflectY(nextPosition, 0);
            this.velocity.y = -this.velocity.y;
            this.onCollideHandler();
        }
        if (this.velocity.y > 0 && nextPosition.y + this.height/2 >= HEIGHT) {
            nextPosition = Vector2.reflectY(nextPosition, HEIGHT);
            this.velocity.y = -this.velocity.y;
            this.onCollideHandler();
        }

        var nextObstruction: Obstruction = {
            position: nextPosition,
            width: this.width,
            height: this.height
        };

        // Paddle hit
        this.obstructions.forEach((obstruction) => {
            if (this.velocity.x < 0 && obstruction.position.x < this.position.x && isOverlap(obstruction, nextObstruction)) {
                // The right side of the obstruction hit the left side of the ball
                nextPosition = Vector2.reflectX(nextPosition, obstruction.position.x + obstruction.width/2);
                this.velocity.x = -this.velocity.x;
                this.velocity = this.velocity.scale(1.1);
                this.onCollideHandler();
            }
            if (this.velocity.x > 0 && obstruction.position.x > this.position.x && isOverlap(obstruction, nextObstruction)) {
                // The left side of the obstruction hit the right side of the ball
                nextPosition = Vector2.reflectX(nextPosition, obstruction.position.x - obstruction.width/2);
                this.velocity.x = -this.velocity.x;
                this.velocity = this.velocity.scale(1.1);
                this.onCollideHandler();
            }
        });

        this.position = nextPosition;
        this.updateElement();

        if (this.position.x < 0 || this.position.x >= WIDTH) {
            this.onOutHandler();
        }
    }

    public reset(): void {
        this.position.x = WIDTH / 2;
        this.position.y = HEIGHT / 2;
        this.velocity = new Vector2(0, 0);
    }

    public launch(): void {
        var angle = (Math.random() * Math.PI/2) - Math.PI/4;
        this.velocity.x = (Math.random() > 0.5 ? 1 : -1) * Math.cos(angle) * 250;
        this.velocity.y = Math.sin(angle) * 250;
    }

    public onOut(func: () => void) {
        this.onOutHandler = func;
    }
    public onCollide(func: () => void) {
        this.onCollideHandler = func;
    }
}

enum GameState {
    Reset,
    Ready,
    Playing
}

interface KeyboardHandler {
    onKeyDown: (keyCode: number) => void;
    onKeyUp: (keyCode: number) => void;
}

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
            this.gain.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.10);
            this.gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.35);
        }
    }

    public playPing(): void {
        if (this.audioContext) {
            this.oscillator.frequency.setValueAtTime(220 + Math.random() * 660, this.audioContext.currentTime);
            this.gain.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.10);
            this.gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.20);
        }
    }
}

class Game implements KeyboardHandler {
    private state: GameState = GameState.Reset;

    private player: Paddle;
    private cpu: Paddle;
    private ball: Ball;

    private playerScore: number = 0;
    private cpuScore: number = 0;

    private audio: GameAudio;

    private playerScoreEl: HTMLDivElement;
    private cpuScoreEl: HTMLDivElement;

    private objects: Array<GameObject> = [];

    constructor(private container: HTMLDivElement) {
        this.audio = new GameAudio();

        this.container.style.position = 'relative';
        this.container.style.width = WIDTH + 'px';
        this.container.style.height = HEIGHT + 'px';

        this.playerScoreEl = createDiv(container, 'score player');
        this.cpuScoreEl = createDiv(container, 'score cpu');

        this.updateScore();

        this.player = new Paddle(createDiv(container, 'paddle'), PlayerSide.Left);
        this.objects.push(this.player);

        this.cpu = new Paddle(createDiv(container, 'paddle'), PlayerSide.Right);
        this.objects.push(this.cpu);

        this.ball = new Ball(createDiv(container, 'ball'), [this.player, this.cpu]);
        this.objects.push(this.ball);

        this.ball.onOut(() => this.onBallOut());
        this.ball.onCollide(() => this.audio.playPing());

        this.cpu.follow(this.ball);
    }

    public start(): void {
        startLoop((timeDelta: number): void => {
            this.objects.forEach((go: GameObject) => {
                go.update(timeDelta);
            });
        });
        this.state = GameState.Ready;
    }

    private onBallOut(): void {
        this.audio.playBallOut();

        if (this.ball.position.x < WIDTH / 2) {
            this.cpuScore += 1;
        } else {
            this.playerScore += 1;
        }
        this.updateScore();
        this.ball.reset();
        this.player.reset();
        this.cpu.reset();
        this.state = GameState.Ready;
    }

    private updateScore(): void {
        var setText = (el: HTMLDivElement, score: number) => {
            while (el.childNodes.length > 0) {
                el.removeChild(el.childNodes[0]);
            }
            el.appendChild(document.createTextNode(score.toString()));
        };
        setText(this.playerScoreEl, this.playerScore);
        setText(this.cpuScoreEl, this.cpuScore);
    }

    public onKeyUp(keyCode: number): void {
        switch (this.state) {
            case GameState.Playing:
                if (keyCode == 38) {
                    this.player.releaseUp();
                }
                if (keyCode == 40) {
                    this.player.releaseDown();
                }
                break;
        }
    }

    public onKeyDown(keyCode: number): void {
        switch (this.state) {
            case GameState.Playing:
                if (keyCode == 38) {
                    this.player.goUp();
                }
                if (keyCode == 40) {
                    this.player.goDown();
                }
                break;
            case GameState.Ready:
                if (keyCode == 32) {
                    this.state = GameState.Playing;
                    this.ball.launch();
                }
                break;
        }
    }
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

var keyboardDelegate = new KeyboardDelegate();
var game: Game = new Game(<HTMLDivElement>document.getElementById('pong'));
keyboardDelegate.addHandler(game);
game.start();
