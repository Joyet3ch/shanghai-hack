import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));
    req.on('error', reject);
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(raw);
      }
    });
  });

const sendNodeResponse = async (nodeRes, webResponse) => {
  const headers = Object.fromEntries(webResponse.headers.entries());
  nodeRes.writeHead(webResponse.status, headers);
  nodeRes.end(await webResponse.text());
};

const createEdgeRequest = async (nodeReq, body) => {
  const url = new URL(nodeReq.url, 'http://127.0.0.1:5173');
  return new Request(url, {
    method: nodeReq.method,
    headers: nodeReq.headers,
    body: nodeReq.method === 'GET' || nodeReq.method === 'HEAD' ? undefined : JSON.stringify(body),
  });
};

const runNodeHandler = (handler, nodeReq, nodeRes, body) =>
  handler(
    {
      method: nodeReq.method,
      headers: nodeReq.headers,
      body,
    },
    {
      status(statusCode) {
        nodeRes.statusCode = statusCode;
        return this;
      },
      json(payload) {
        nodeRes.setHeader('Content-Type', 'application/json');
        nodeRes.end(JSON.stringify(payload));
      },
    },
  );

const localApiPlugin = () => ({
  name: 'bridgematch-local-api',
  configureServer(server) {
    const routes = {
      '/api/match': { type: 'edge', module: () => import('./api/match.js') },
      '/api/email': { type: 'edge', module: () => import('./api/email.js') },
      '/api/register-partner': { type: 'node', module: () => import('./api/register-partner.js') },
    };

    server.middlewares.use(async (req, res, next) => {
      const pathname = new URL(req.url, 'http://127.0.0.1:5173').pathname;
      const route = routes[pathname];

      if (!route) {
        next();
        return;
      }

      try {
        const body = await readBody(req);
        const { default: handler } = await route.module();

        if (route.type === 'edge') {
          const webReq = await createEdgeRequest(req, body);
          const webResponse = await handler(webReq);
          await sendNodeResponse(res, webResponse);
          return;
        }

        await runNodeHandler(handler, req, res, body);
      } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.entries(env).forEach(([key, value]) => {
    if (!(key in process.env)) process.env[key] = value;
  });

  return {
    plugins: [
      localApiPlugin(),
      react(),
      tailwindcss(),
    ],
  };
})
