import boot from './boot';

export async function main() {
  // boot modules needed before app starts
  await boot();

  // do all the things
  document.querySelector('#app').innerHTML = `
    <h1>Et voilà!</h1>
		<p>You probably ran \`npm run dev\` and opened this address.</p>
    <p>Make some changes in \`src/main.mjs\` or in the css files, refresh, and see what happens.</p>
  `;
}
