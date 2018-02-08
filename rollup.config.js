import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
    input: 'main.js',
    output: {
        file: 'dist/modules-bundle.js',
        format: 'amd',
        sourcemap: true,
        sourcemapFile: 'dist',
        amd: {
        	id: 'modules-bundle'
        }
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        uglify()
    ]
};