export const prerender = false;

import type { APIRoute } from 'astro';
import { CONVERTKIT_API_KEY, CONVERTKIT_FORM_ID } from 'astro:env/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function wantsJson(request: Request): boolean {
	const accept = request.headers.get('accept') ?? '';
	return accept.includes('application/json');
}

function backPath(request: Request, origin: string): string {
	const referer = request.headers.get('referer');

	if (!referer) return '/';

	try {
		const refUrl = new URL(referer);
		if (refUrl.origin === origin) return refUrl.pathname || '/';
	} catch {
		return '/';
	}

	return '/';
}

function reply(
	request: Request,
	status: number,
	body: { ok: boolean; message: string },
	redirectTo: string,
): Response {
	if (wantsJson(request)) {
		return new Response(JSON.stringify(body), {
			status,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	return Response.redirect(redirectTo, 303);
}

export const POST: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const origin = request.headers.get('origin');
	const path = backPath(request, url.origin);
	const successUrl = `${url.origin}${path}?subscribed=1#subscribe`;
	const errorUrl = `${url.origin}${path}?error=subscribe#subscribe`;

	if (origin && origin !== url.origin) {
		return reply(
			request,
			403,
			{ ok: false, message: 'The form could not be sent.' },
			errorUrl,
		);
	}

	const data = await request.formData();
	const honeypot = String(data.get('company') ?? '').trim();

	if (honeypot) {
		return reply(
			request,
			200,
			{
				ok: true,
				message: 'Subscription successful. Please check your email to confirm.',
			},
			successUrl,
		);
	}

	const email = String(data.get('email') ?? '').trim();

	if (!email || !EMAIL_RE.test(email) || email.length > 200) {
		return reply(
			request,
			400,
			{ ok: false, message: 'A valid email is required.' },
			errorUrl,
		);
	}

	const response = await fetch(
		`https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				api_key: CONVERTKIT_API_KEY,
				email,
			}),
		},
	);

	if (!response.ok) {
		console.error('ConvertKit subscribe failed', response.status);
		return reply(
			request,
			502,
			{
				ok: false,
				message: 'Email failed to submit. Please try again in a few moments.',
			},
			errorUrl,
		);
	}

	return reply(
		request,
		200,
		{
			ok: true,
			message: 'Subscription successful. Please check your email to confirm.',
		},
		successUrl,
	);
};
