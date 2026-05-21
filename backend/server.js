import http from 'node:http';
import { URL } from 'node:url';
import { analyzeMedicines, searchMedicines } from './analysis.js';

const port = Number(process.env.PORT ?? 4000);
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host}`);

  if (request.method === 'OPTIONS') {
    return sendJson(response, 204, null);
  }

  try {
    if (request.method === 'GET' && url.pathname === '/health') {
      return sendJson(response, 200, { ok: true, service: 'SafeMed API' });
    }

    if (request.method === 'GET' && url.pathname === '/medicines') {
      return sendJson(response, 200, searchMedicines(url.searchParams.get('query') ?? ''));
    }

    if (request.method === 'POST' && url.pathname === '/analyze') {
      const body = await readJson(request);
      return sendJson(response, 200, analyzeMedicines(body));
    }

    return sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    const status = error.statusCode ?? 500;
    return sendJson(response, status, {
      error: status === 500 ? 'Internal server error' : error.message,
    });
  }
});

server.listen(port, () => {
  console.log(`SafeMed API listening on http://localhost:${port}`);
});

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    ...corsHeaders,
    'Content-Type': 'application/json; charset=utf-8',
  });

  if (statusCode === 204) {
    response.end();
    return;
  }

  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;

      if (body.length > 1_000_000) {
        reject(httpError(413, 'Payload too large'));
        request.destroy();
      }
    });

    request.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(httpError(400, 'Invalid JSON'));
      }
    });

    request.on('error', reject);
  });
}

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
