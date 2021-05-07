const path = require('path')
const { createFilter } = require('@rollup/pluginutils')
const { transform, slugify } = require('@linaria/babel-preset')

const runtimePublicPath = '/@linaria-cache/'

module.exports = () => {
    const _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
    const include = _ref.include
    const exclude = _ref.exclude
    const sourceMap = _ref.sourceMap
    const preprocessor = _ref.preprocessor
    const rest = {}
    Object.assign(rest, _ref)
    delete rest.include
    delete rest.exclude
    delete rest.sourceMap
    delete rest.preprocessor

    const filter = createFilter(include, exclude)
    const cssLookup = {}
    const lookupFilenames = {}
    const lookupFirstLoad = {}

    return {
        name: 'linaria',
        load: (id) => cssLookup[id],
        resolveId: (importee)  => cssLookup[importee] && importee,
        transform: (code, id) => {
            if (!filter(id) || id in cssLookup || /^(?:.*[\\\/])?node_modules(?:[\\\/].*)?$/.test(id)) return

            const result = transform(code, {
                filename: id,
                preprocessor,
                pluginOptions: rest,
            })

            if (!result.cssText) return

            let { cssText } = result
            const slug = slugify(cssText)

            const basename = path.basename(id);
            const filename = runtimePublicPath.concat(
                    basename.replace(/(\.js|\.jsx|\.tsx|\.ts)$/, ""), 
                "_")
                .concat(slug, ".css")
            
            if (sourceMap && result.cssSourceMapText) {
                const map = Buffer.from(result.cssSourceMapText).toString('base64')
                cssText += `/*# sourceMappingURL=data:application/json;base64,${map}*/`
            }

            if (lookupFilenames[id]) {
                result.code += `\nimport { updateStyle } from "/@vite/client";\nupdateStyle('${id}', \`${cssText.trim()}\`);\n`

                if (lookupFirstLoad[id]) {
                    lookupFirstLoad[id] = false
                    result.code += `\nimport { removeStyle } from "/@vite/client";\nremoveStyle('${lookupFilenames[id]}');\n`
                }

                delete cssLookup[lookupFilenames[id]]
            } else {
                result.code +=  `\nimport ${JSON.stringify(filename)};\n`
                lookupFirstLoad[id] = true
            }

            cssLookup[filename] = cssText
            lookupFilenames[id] = filename

            return { code: result.code, map: result.sourceMap }
        },
    }
}
