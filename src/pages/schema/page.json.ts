import type { APIRoute } from 'astro';
import { buildCorpusGraph, serializeJsonLd } from '../../lib/seo';

export const GET: APIRoute = ({ site }) => {
	if (!site) {
		return new Response('Set site in astro.config.mjs.', { status: 500 });
	}

	return new Response(serializeJsonLd(buildCorpusGraph(site)), {
		headers: { 'Content-Type': 'application/ld+json; charset=utf-8' },
	});
};
