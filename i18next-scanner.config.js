module.exports = {
    input: ['src/**/*.{js,jsx}', '-src/**/*.spec.{js,jsx}'], // paths to parse
    output: './', // output directory
    options: {
        debug: false,
        removeUnusedKeys: true,
        func: {
            list: ['t', 'i18n.t', 'props.t'],
            extensions: ['.js', '.jsx']
        },
        lngs: ['en', 'es'],
        defaultLng: 'en', 
        defaultNs: 'translation', 
        resource: {
            loadPath: 'public/locales/{{lng}}/{{ns}}.json',
            savePath: 'public/locales/{{lng}}/{{ns}}.json', 
            jsonIndent: 2,
            lineEnding: '\n'
        }
    }
};
