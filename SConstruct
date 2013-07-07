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

tsSources= [ os.path.join('src', source) for source in [
    'Helpers.ts',
    'KeyboardDelegate.ts',
    'Constants.ts',
    'GameAudio.ts',
    'GameObject.ts',
    'Physics.ts',
    'Score.ts',
    'Ball.ts',
    'Paddle.ts',
    'Pong.ts',
] ]

jsIntermediates = [ source.split('.ts', 1)[0] + '.js' for source in tsSources ]

for tsSource in tsSources:
    env.Typescript(tsSource)
env.Combine(os.path.join('out', 'pong.min.js'), jsIntermediates)
