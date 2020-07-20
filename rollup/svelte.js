import svelte from 'rollup-plugin-svelte';
import preprocess from 'svelte-preprocess';
import postcss from 'postcss';
const postcssConfig = require('../postcss.config.js');

export default (conf) => {
  const postCssProcessor = postcss(postcssConfig(conf.isProd));

  const plugin = svelte({
    dev: !conf.isProd,
    emitCss: false,
    preprocess: preprocess({
      replace: [
        // Replace `process.env.{prop}` with the actual stringified value.
        [/process\.env\.(\w+)/g, (_, match) => JSON.stringify(process.env[match])],
        // Example of "supporting" a blade-like syntax:
        [/@if\s*\((.*?)\)$/gim, '{#if $1}'],
        [/@elseif\s*\((.*?)\)$/gim, '{:else if $1}'],
        [/@else$/gim, '{:else}'],
        [/@endif$/gim, '{/if}'],
        [/@each\s*\((.*?)\)$/gim, '{#each $1}'],
        [/@endeach$/gim, '{/each}'],
        [/@await\s*\((.*?)\)$/gim, '{#await $1}'],
        [/@then\s*(?:\((.*?)\))?$/gim, '{:then $1}'],
        [/@catch\s*(?:\((.*?)\))?$/gim, '{:catch $1}'],
        [/@endawait$/gim, '{/await}'],
        [/@debug\s*\((.*?)\)$/gim, '{@debug $1}'],
        [/@html\s*\((.*?)\)$/gim, '{@html $1}'],
      ],
    }),
    css: async function (css) {
      try {
        const result = await postCssProcessor.process(css.code, { from: js_in, to: css_out + 'main.css' });

        css.code = result.css;

        css.write(result.opts.to);
        if (result.map) {
          fs.outputFile(result.opts.to.replace('.css', '.map.css'), result.map, () => true);
        }
      } catch (e) {
        console.error('#### PostCSS error');
        console.error(e.reason, ' in ', e.file);
      }
    },
  });

  return {
    plugin,
  };
};
