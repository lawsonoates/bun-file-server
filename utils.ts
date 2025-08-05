import { readdirSync, statSync } from 'node:fs';

export function getContentType(path: string) {
	if (path.endsWith('.html')) return 'text/html';
	if (path.endsWith('.js')) return 'application/javascript';
	if (path.endsWith('.css')) return 'text/css';
	if (path.endsWith('.json')) return 'application/json';
	if (path.endsWith('.png')) return 'image/png';
	if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
	if (path.endsWith('.gif')) return 'image/gif';
	return 'application/octet-stream';
}

export function isDir(path: string) {
	const stats = statSync(path);
	return stats.isDirectory();
}

export const generateDirectoryListing = (path: string, urlPath: string) => {
	const items = readdirSync(path).sort((a, b) =>
		a.localeCompare(b, undefined, { sensitivity: 'base' }),
	);

	// Normalize the path to prevent double slashes
	const normalizedPath = path.replace(/\/+/g, '/');

	// Filter out items that can't be accessed and get their stats
	const itemsWithStats = items
		.map((item) => {
			const itemPath =
				normalizedPath === '/' ? `/${item}` : `${normalizedPath}/${item}`;
			try {
				const stats = statSync(itemPath);
				return {
					name: item,
					isDir: stats.isDirectory(),
					accessible: true,
				};
			} catch (error) {
				// Skip files we can't access
				// console.warn(`Warning: Could not access ${itemPath}:`, error);
				return null;
			}
		})
		.filter((item) => item !== null);

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Directory listing for ${urlPath}</title>
</head>
<body>
<h1>Directory listing for ${urlPath}</h1>
<hr>
<ul>
${itemsWithStats
	.map(
		(item) =>
			`<li><a href="${urlPath}${item.name}${item.isDir ? '/' : ''}">${item.name}${item.isDir ? '/' : ''}</a></li>`,
	)
	.join('\n')}
</ul>
<hr>
</body>
</html>`;
};
