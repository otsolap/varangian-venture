import site from '../data/site.json';
import seo from '../data/seo.json';
import home from '../data/home.json';
import about from '../data/about.json';
import services from '../data/services.json';
import contact from '../data/contact.json';
import legal from '../data/legal.json';

export type SeoPage = {
	path: string;
	title: string;
	description: string;
};

const pages: SeoPage[] = [
	{ path: '/', title: home.meta.title, description: home.meta.description },
	{ path: '/services/', title: services.meta.title, description: services.meta.description },
	{ path: '/about/', title: about.meta.title, description: about.meta.description },
	{ path: '/contact/', title: contact.meta.title, description: contact.meta.description },
	{ path: '/legal/', title: legal.meta.title, description: legal.meta.description },
];

export function indexablePages(): SeoPage[] {
	return pages;
}

export function fullTitle(title: string | undefined, siteName = site.title): string {
	const pageTitle = title?.trim() || siteName;
	if (pageTitle === siteName) return siteName;
	const suffix = ` — ${siteName}`;
	if (pageTitle.endsWith(suffix)) return pageTitle;
	return `${pageTitle}${suffix}`;
}

// Directory pages use a trailing slash. Files such as /schema/page.json do not.
export function canonicalPath(pathname: string): string {
	if (!pathname || pathname === '/') return '/';
	const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
	if (/\/[^/]+\.[a-z0-9]+$/i.test(path)) return path;
	return path.endsWith('/') ? path : `${path}/`;
}

export function canonicalUrl(siteUrl: URL, pathname: string): string {
	const url = new URL(canonicalPath(pathname), siteUrl);
	url.search = '';
	url.hash = '';
	return url.href;
}

export function robotsContent(noindex: boolean): string {
	if (noindex) return 'noindex, nofollow';
	return 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
}

export function absoluteUrl(siteUrl: URL, value: string): string {
	return new URL(value, siteUrl).href;
}

type GraphNode = Record<string, unknown>;

function identityNodes(siteUrl: URL): GraphNode[] {
	const homeUrl = canonicalUrl(siteUrl, '/');
	const aboutUrl = canonicalUrl(siteUrl, '/about/');
	const orgId = new URL('/#organization', siteUrl).href;
	const personId = new URL('/#person', siteUrl).href;
	const websiteId = new URL('/#website', siteUrl).href;

	return [
		{
			'@type': 'Organization',
			'@id': orgId,
			name: site.title,
			url: homeUrl,
			description: site.description,
			email: seo.email,
			founder: { '@id': personId },
			sameAs: seo.sameAs,
		},
		{
			'@type': 'Person',
			'@id': personId,
			name: seo.person.name,
			url: aboutUrl,
			email: seo.email,
			sameAs: seo.sameAs,
			worksFor: { '@id': orgId },
		},
		{
			'@type': 'WebSite',
			'@id': websiteId,
			url: homeUrl,
			name: site.title,
			description: site.description,
			publisher: { '@id': orgId },
			inLanguage: 'en',
		},
	];
}

function webPageNode(siteUrl: URL, page: { path: string; title: string; description?: string }): GraphNode {
	const url = canonicalUrl(siteUrl, page.path);
	const orgId = new URL('/#organization', siteUrl).href;
	const websiteId = new URL('/#website', siteUrl).href;

	return {
		'@type': 'WebPage',
		'@id': `${url}#webpage`,
		url,
		name: fullTitle(page.title),
		...(page.description ? { description: page.description } : {}),
		isPartOf: { '@id': websiteId },
		about: { '@id': orgId },
		inLanguage: 'en',
	};
}

export function buildPageGraph(
	siteUrl: URL,
	page: { path: string; title: string; description?: string },
): { '@context': string; '@graph': GraphNode[] } {
	return {
		'@context': 'https://schema.org',
		'@graph': [...identityNodes(siteUrl), webPageNode(siteUrl, page)],
	};
}

export function buildCorpusGraph(siteUrl: URL): { '@context': string; '@graph': GraphNode[] } {
	return {
		'@context': 'https://schema.org',
		'@graph': [...identityNodes(siteUrl), ...indexablePages().map((page) => webPageNode(siteUrl, page))],
	};
}

export function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function llmsTxt(siteUrl: URL): string {
	const lines = [
		`# ${site.title}`,
		'',
		`> ${site.description}`,
		'',
		'The pages below are the public pages of this site.',
		'',
		'## Pages',
		'',
	];

	for (const page of indexablePages()) {
		const url = canonicalUrl(siteUrl, page.path);
		lines.push(`- [${fullTitle(page.title)}](${url}): ${page.description}`);
	}

	lines.push(
		'',
		'## Data',
		'',
		`- [Schema map](${canonicalUrl(siteUrl, '/schemamap.xml')})`,
		`- [Page schema](${canonicalUrl(siteUrl, '/schema/page.json')})`,
		`- [Sitemap](${new URL('/sitemap-index.xml', siteUrl).href})`,
		'',
	);

	return lines.join('\n');
}

export function schemaMapXml(siteUrl: URL): string {
	const loc = canonicalUrl(siteUrl, '/schema/page.json');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url contentType="structuredData/schema.org">
    <loc>${loc}</loc>
  </url>
</urlset>
`;
}

export const twitterSite = seo.twitter;
