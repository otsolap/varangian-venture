export const prerender = false;

import type { APIRoute } from 'astro';
import { CONVERTKIT_API_KEY, CONVERTKIT_FORM_ID } from 'astro:env/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(status: number, body: { ok: boolean; message: string }): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export const POST: APIRoute = async ({ request }) => {
	const origin = request.headers.get('origin');
	const url = new URL(request.url);

	if (origin && origin !== url.origin) {
		return json(403, { ok: false, message: 'The form could not be sent.' });
	}

	const data = await request.formData();
	const honeypot = String(data.get('company') ?? '').trim();

	if (honeypot) {
		return json(200, {
			ok: true,
			message: 'Subscription successful. Please check your email to confirm.',
		});
	}

	const email = String(data.get('email') ?? '').trim();

	if (!email || !EMAIL_RE.test(email)) {
		return json(400, { ok: false, message: 'A valid email is required.' });
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
		return json(502, {
			ok: false,
			message: 'Email failed to submit. Please try again in a few moments.',
		});
	}

	return json(200, {
		ok: true,
		message: 'Subscription successful. Please check your email to confirm.',
	});
};
