# vite-plugin-linaria

A Vite plugin for linaria using vite virtual files for development

### Install (yarn or npm)

**node version:** >=12.0.0

**vite version:** >=2.0.0

```
yarn add vite-plugin-linaria -D
```

or

```
npm i vite-plugin-linaria -D
```

## Usage

- Add plugin in vite.config

```js
// vite.config.js
import VitePluginLinaria from 'vite-plugin-linaria'

export default {
  plugins: [
    // other plugins
    VitePluginLinaria()
  ],
}
```

## License

MIT
