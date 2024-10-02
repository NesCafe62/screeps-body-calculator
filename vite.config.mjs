import { defineConfig } from 'vite';
import pozitronPlugin from 'vite-plugin-pozitron';
// import path from 'path';

export default defineConfig({
	base: './',
	plugins: [pozitronPlugin()],
	server: {
		port: 3000,
	},
	build: {
		minify: false,
		polyfillModulePreload: false,
	},
	resolve: {
		alias: {
			'@mdi/font': '/node_modules/@mdi/font',
			// '~': path.resolve(__dirname, './node_modules')
		},
	},

	/* css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@import "@mdi/font/scss/materialdesignicons.scss";`
			}
		}
	}, */

	/* css: {
		preprocessorOptions: {
			scss: {
				additionalData: (process.env.APP_ENV === 'development')
					? `$icon-font-path: "https://example.com:5133/dist/@fs/home/bigmandan/projects/syncview/vite/node_modules/bootstrap-sass/assets/fonts/bootstrap/";`
					: `$icon-font-path: "~/bootstrap-sass/assets/fonts/bootstrap/";`
			}
		}
	}, */
});