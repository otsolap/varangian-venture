import type { APIRoute } from 'astro';
import { llmsTxt } from '../lib/seo';

export const GET: APIRoute = ({ site }) => {
	if (!site) {
		return new Response('Set site in astro.config.mjs.', { status: 500 });
	}

	return new Response(llmsTxt(site), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
