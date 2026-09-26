import type { APIRoute } from 'astro';
import { schemaMapXml } from '../lib/seo';

export const GET: APIRoute = ({ site }) => {
	if (!site) {
		return new Response('Set site in astro.config.mjs.', { status: 500 });
	}

	return new Response(schemaMapXml(site), {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' },
	});
};
