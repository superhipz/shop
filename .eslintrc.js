module.exports = {
    root: true,
    env: {
        node: true,
        commonjs: true,
        es6: true,
        jquery: false,
        jest: true,
        jasmine: true
    },
    globals: {
        assert: true
    },
    extends: 'airbnb-base/legacy',
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2018
    },
    rules: {
        indent: ['error', 4],
        'no-tabs': 'error',
        'no-unused-vars': 'warn',
        'no-console': 'off',
        'no-underscore-dangle': 'off',
        'arrow-spacing': ['error', { before: true, after: true }],
        'max-len': ['error', {
            code: 150,
            ignoreComments: true,
            ignoreTrailingComments: true,
            ignoreUrls: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
            ignoreRegExpLiterals: true
        }]
    },
    overrides: [
        {
            files: ['test/**/*.js'],
            rules: {
                'func-names': 'off',
                'no-undef': 'off',
                'no-console': 'off'
            }
        }
    ]
};
