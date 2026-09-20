export const prerender = false;

import type { APIRoute } from 'astro';
import { CONTACT_FROM, CONTACT_TO } from 'astro:env/server';
import { env } from 'cloudflare:workers';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type EmailBinding = {
	send: (message: {
		to: string;
		from: string;
		subject: string;
		text: string;
		replyTo?: string;
	}) => Promise<void>;
};

function wantsJson(request: Request): boolean {
	const accept = request.headers.get('accept') ?? '';
	return accept.includes('application/json');
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
	const contactUrl = new URL('/contact', url.origin);
	const origin = request.headers.get('origin');

	if (origin && origin !== url.origin) {
		return reply(
			request,
			403,
			{ ok: false, message: 'The form could not be sent.' },
			`${contactUrl}?error=1`,
		);
	}

	const data = await request.formData();
	const honeypot = String(data.get('company') ?? '').trim();

	if (honeypot) {
		return reply(
			request,
			200,
			{ ok: true, message: 'Message sent.' },
			`${contactUrl}?sent=1`,
		);
	}

	const name = String(data.get('name') ?? '').trim();
	const email = String(data.get('email') ?? '').trim();
	const message = String(data.get('message') ?? '').trim();

	if (!name || !email || !message) {
		return reply(
			request,
			400,
			{ ok: false, message: 'Name, email, and message are required.' },
			`${contactUrl}?error=missing`,
		);
	}

	if (!EMAIL_RE.test(email) || message.length > 5000 || name.length > 200) {
		return reply(
			request,
			400,
			{ ok: false, message: 'Check the form fields and try again.' },
			`${contactUrl}?error=invalid`,
		);
	}

	const to = CONTACT_TO;
	const from = CONTACT_FROM || CONTACT_TO;
	const text = [
		`Name: ${name}`,
		`Email: ${email}`,
		'',
		message,
	].join('\n');

	try {
		const mail = (env as { EMAIL?: EmailBinding }).EMAIL;

		if (!mail) {
			throw new Error('EMAIL binding is missing');
		}

		await mail.send({
			to,
			from,
			replyTo: email,
			subject: `Contact form: ${name}`,
			text,
		});
	} catch {
		console.error('Contact form send failed');
		return reply(
			request,
			500,
			{ ok: false, message: 'The message did not send. Please try again in a moment.' },
			`${contactUrl}?error=send`,
		);
	}

	return reply(
		request,
		200,
		{ ok: true, message: 'Message sent. I will get back to you soon.' },
		`${contactUrl}?sent=1`,
	);
};
