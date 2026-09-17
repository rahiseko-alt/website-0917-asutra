import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist/client');
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml','.json':'application/json'};
if(!fs.existsSync(path.join(root,'index.html'))){console.error('Build missing. Run npm ci and npm run build in app first.');process.exit(1);}
const server=http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
 let file=path.resolve(root,'.'+pathname);
 if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 if(file===root||!path.extname(file))file=path.join(root,'index.html');
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
 if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
});
server.on('error',e=>{if(e.code==='EADDRINUSE')console.error(`Port ${port} is already in use. Open http://127.0.0.1:${port} or close the other preview.`);else console.error(e.message);process.exit(1);});
server.listen(port,'127.0.0.1',()=>console.log(`Portfolio ready: http://127.0.0.1:${port}\nKeep this window open. Press Ctrl+C to stop.`));
