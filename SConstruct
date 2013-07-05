import os

env = Environment(env=os.environ, BUILDERS={
    'Typescript': Builder(
        action='tsc --out $TARGET $SOURCE',
        suffix='.js',
        src_suffix='.ts',
    ),
    'Combine': Builder(
        action='cat $SOURCES > $TARGET',
        suffix='.min.js',
        src_suffix='.js',
    )
})

sources = [
    'src/Helpers.ts',
    'src/KeyboardDelegate.ts',
    'src/Constants.ts',
    'src/GameAudio.ts',
    'src/GameObject.ts',
    'src/Physics.ts',
    'src/Score.ts',
    'src/Ball.ts',
    'src/Paddle.ts',
    'src/Pong.ts',
]

env.Typescript(sources)
env.Combine('out/pong.min.js', [ source.split('.ts', 1)[0] + '.js' for source in sources ])
