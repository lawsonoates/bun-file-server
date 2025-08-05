#!/usr/bin/env bun
import { serve } from 'bun';
import { parseArgs } from 'node:util';
import { generateDirectoryListing, getContentType, isDir } from './utils';

const USAGE = `Usage: bun-file-server [options] [directory]

Options:
  -p, --port PORT    Port to listen on (default: 3000)
  -h, --help        Show this help message

Examples:
  bun-file-server                    # Serve current directory on port 3000
  bun-file-server --port 8080        # Serve on port 8080
  bun-file-server /path/to/dir       # Serve specific directory
  bun-file-server -p 8080 /some/dir  # Serve directory on custom port`;

let values: { port: string; help?: boolean };
let positionals: string[];

try {
	const parsedArgs = parseArgs({
		args: Bun.argv,
		options: {
			port: {
				type: 'string',
				short: 'p',
				long: 'port',
				default: '3000',
			},
			help: {
				type: 'boolean',
				short: 'h',
				long: 'help',
			},
		},
		allowPositionals: true,
		strict: true,
	});
	values = parsedArgs.values;
	positionals = parsedArgs.positionals;

	if (values.help) {
		console.log(USAGE);
		process.exit(0);
	}
} catch (_) {
	console.error('Error: Invalid arguments');
	console.error(USAGE);
	process.exit(1);
}

const dirToServe = positionals[2] ?? '/';

if (!isDir(dirToServe)) {
	console.error(`Error: "${dirToServe}" is not a valid directory`);
	process.exit(1);
}

const PORT = parseInt(values.port as string);

serve({
	port: PORT,
	routes: {
		'/*': {
			GET: async (req) => {
				const url = new URL(req.url);
				const pathname = decodeURIComponent(url.pathname);

				const logResponse = (status: number) => {
					console.log(`GET ${status} ${pathname}`);
				};

				if (pathname.includes('..')) {
					logResponse(403);
					return new Response('Forbidden', { status: 403 });
				}

				// Normalize the path to prevent double slashes
				const fsPath = `${dirToServe}${pathname}`.replace(/\/+/g, '/');

				// Handle common browser requests that we want to ignore silently
				if (
					fsPath.includes('/.well-known/') ||
					fsPath.includes('/favicon.ico')
				) {
					logResponse(404);
					return new Response('Not Found', { status: 404 });
				}

				try {
					if (isDir(fsPath)) {
						const listing = generateDirectoryListing(
							fsPath,
							pathname.endsWith('/') ? pathname : `${pathname}/`,
						);
						logResponse(200);
						return new Response(listing, {
							headers: { 'Content-Type': 'text/html' },
						});
					}

					logResponse(200);
					return new Response(Bun.file(fsPath), {
						headers: {
							'Content-Type': getContentType(fsPath),
							'Cache-Control': 'no-cache',
						},
					});
				} catch (error) {
					console.error(error);
					logResponse(404);
					return new Response('Internal Server Error', { status: 500 });
				}
			},
		},
	},
});

console.log(
	`Server running on http://localhost:${PORT} for directory ${dirToServe}`,
);
