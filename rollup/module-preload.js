/**
 * A Rollup plugin to generate a list of import dependencies for each entry
 * point in the module graph. This is then used by the template to generate
 * the necessary `<link rel="modulepreload">` tags
 * or for you to know what files should be exported with wich entry points
 * if you separate sources at the end
 * @return {Object}
 */
export default function modulepreloadPlugin() {
  return {
    name: 'modulepreload',
    generateBundle(options, bundle) {
      // A mapping of entry chunk names to their full dependency list.
      const modulepreloadMap = {};

      // Loop through all the chunks to detect entries.
      for (const [fileName, chunkInfo] of Object.entries(bundle)) {
        if (chunkInfo.isEntry || chunkInfo.isDynamicEntry) {
          modulepreloadMap[chunkInfo.name] = [fileName, ...chunkInfo.imports];
        }
      }

      this.emitFile({
        type: 'asset',
        fileName: 'modulepreload.json',
        source: JSON.stringify(modulepreloadMap, null, 2),
      });
    },
  };
}
