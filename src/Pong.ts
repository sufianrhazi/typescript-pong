///<reference path="Ball.ts"/>
///<reference path="Constants.ts"/>
///<reference path="GameAudio.ts"/>
///<reference path="GameObject.ts"/>
///<reference path="Helpers.ts"/>
///<reference path="KeyboardDelegate.ts"/>
///<reference path="Paddle.ts"/>
///<reference path="Score.ts"/>

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

        startLoop((timeDelta: number): void => {
            this.objects.forEach((go: GameObject) => {
                go.update(timeDelta);
            });
        });
    }

    public reset(): void {
        this.ball.reset();
        this.player.reset();
        this.cpu.reset();
        this.startEl.style.display = 'block';
        this.state = GameState.Ready;
    }

    private startGame() {
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
