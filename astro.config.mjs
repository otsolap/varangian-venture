// @ts-check
import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import varangianTheme from 'varangian-theme';

// https://astro.build/config
export default defineConfig({
	site: 'https://varangianventure.com',
	adapter: cloudflare({
		imageService: 'compile',
		prerenderEnvironment: 'node',
	}),
	integrations: [varangianTheme(), sitemap()],
	session: false,
	env: {
		schema: {
			CONVERTKIT_API_KEY: envField.string({ context: 'server', access: 'secret' }),
			CONVERTKIT_FORM_ID: envField.string({ context: 'server', access: 'secret' }),
			CONVERTKIT_SECRET_KEY: envField.string({
				context: 'server',
				access: 'secret',
				optional: true,
			}),
			CONTACT_TO: envField.string({ context: 'server', access: 'secret' }),
			CONTACT_FROM: envField.string({
				context: 'server',
				access: 'secret',
				optional: true,
			}),
		},
	},
});
