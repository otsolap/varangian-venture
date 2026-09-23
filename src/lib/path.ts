export function isCurrentPath(pathname: string, href: string): boolean {
	const normalize = (value: string) => (value === '/' ? '/' : value.replace(/\/+$/, ''));
	return normalize(pathname) === normalize(href);
}
