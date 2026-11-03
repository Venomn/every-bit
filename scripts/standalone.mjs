import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const read = name => readFile(new URL(`../dist/${name}`,import.meta.url),'utf8');
const [html,css,icon,engine,book,app] = await Promise.all(['index.html','style.css','icon.svg','engine.mjs','book.mjs','app.js'].map(read));
const script = [engine,book,app].join('\n').replace(/^import .+ from ['"].+['"];\n/gm,'').replace(/^export /gm,'');
const result = html
  .replace('<link rel="stylesheet" href="style.css">',`<style>${css}</style>`)
  .replace('  <script type="module" src="app.js"></script>\n','')
  .replace('href="icon.svg"',`href="data:image/svg+xml,${encodeURIComponent(icon)}"`)
  .replace('</body>',`<script>\n(()=>{\n${script.replace(/<\/script/gi,'<\\/script')}\n})();\n</script>\n</body>`);
const destination = new URL('../index.html',import.meta.url);
if(process.argv.includes('--check')) {
  if(await readFile(destination,'utf8') !== result) throw new Error('index.html is stale. Run npm run build:standalone.');
  console.log('Standalone index.html matches the modular source.');
} else {
  await writeFile(destination,result);
  console.log(fileURLToPath(destination));
}
