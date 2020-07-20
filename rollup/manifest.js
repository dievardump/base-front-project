import globby from 'globby';

export default (conf) => {
  // to keep entries in the manifest file
  const manifest = conf.manifest || {};

  /**
   * A Rollup plugin to generate a manifest of chunk names to their filenames
   * (including their content hash). This manifest is then used by the template
   * to point to the currect URL.
   * @return {Object}
   */
  function manifestPlugin() {
    return {
      name: 'manifest',
      generateBundle(options, bundle) {
        for (const [name, assetInfo] of Object.entries(bundle)) {
          manifest[assetInfo.name] = name;
        }

        this.emitFile({
          type: 'asset',
          fileName: 'manifest.json',
          source: JSON.stringify(manifest, null, 2),
        });

        cleanManifest(manifest, options);
      },
    };
  }

  /**
   * remove files that are not in the manifest
   * from the output dir
   * @param json manifest
   */
  async function cleanManifest(manifest, options) {
    const path_output = options.dir || conf.js_out;

    const publicModules = new Set(await globby('*.+(js|mjs)', { cwd: path_output }));

    // Remove files from the `publicModules` set if they're in the manifest.
    for (const fileName of Object.values(manifest)) {
      if (publicModules.has(fileName)) {
        publicModules.delete(fileName);
      }
    }

    // Delete all remaining modules (not in the manifest).
    for (const fileName of publicModules) {
      await fs.remove(path.join(path_output, fileName));
    }
  }

  return {
    plugin: manifestPlugin,
  };
};
