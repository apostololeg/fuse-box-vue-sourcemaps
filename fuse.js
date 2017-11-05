const autoprefixer = require('autoprefixer')
const {
    FuseBox,
    VueComponentPlugin,
    BabelPlugin,
    QuantumPlugin,
    StylusPlugin,
    CSSResourcePlugin,
    PostCSSPlugin,
    CSSPlugin,
    WebIndexPlugin,
    Sparky
} = require('fuse-box')

let fuse
let isProduction = false

Sparky.task('set-prod', () => isProduction = true)

Sparky.task('clean', () => {
    Sparky
        .src('./dist')
        .clean('dist/')
})

Sparky.task('watch-assets', () => {
    Sparky
        .watch('./assets', { base: './src' })
        .dest('./dist')
})

Sparky.task('copy-assets', () => {
    Sparky
        .src('./assets', { base: './src' })
        .dest('./dist')
})

Sparky.task('config', () => {
    fuse = FuseBox.init({
        homeDir: './src',
        // hash: isProduction,
        output: 'dist/$name.js',
        sourceMaps: true,
        polyfillNonStandardDefaultUsage: true,
        plugins: [
            VueComponentPlugin({
                script: BabelPlugin({
                    sourceMaps: true
                }),
                style: [
                    StylusPlugin(),
                    PostCSSPlugin([autoprefixer]),
                    CSSPlugin()
                ]
            }),
            WebIndexPlugin({
                template: './src/index.html'
            }),
            isProduction && QuantumPlugin({
                bakeApiIntoBundle: 'vendor',
                uglify: true,
                treeshake: true
            }),
        ]
    })

    if (!isProduction){
        fuse.dev({
            // open: true,
            port: 8081
        })
    }

    const app = fuse
        .bundle('build')
        .target('browser')
        .instructions('> index.js')

    if (!isProduction){
        app
            .watch()
            .hmr() // hot module reloading
    }
})

Sparky.task('default',
    ['clean', 'watch-assets', 'config'],
    () => fuse.run())

Sparky.task('dist',
    ['clean', 'copy-assets', 'set-prod', 'config'],
    () => fuse.run())
