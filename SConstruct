import os

env = Environment(env=os.environ, BUILDERS={
    'Typescript': Builder(action='tsc --out $TARGET $SOURCE'),
    'Closure': Builder(action='closure-compiler $SOURCES > $TARGET')
})

sources = [
    'src/Ball.ts',
    'src/Constants.ts',
    'src/GameAudio.ts',
    'src/GameObject.ts',
    'src/Helpers.ts',
    'src/KeyboardDelegate.ts',
    'src/Paddle.ts',
    'src/Physics.ts',
    'src/Pong.ts',
    'src/Score.ts',
]

js = [ source.rsplit('.', 1)[0] + '.js' for source in sources ]

env.Closure('out/Pong.min.js', js)
for ts, js in zip(sources, js):
    env.Typescript(js, ts)
