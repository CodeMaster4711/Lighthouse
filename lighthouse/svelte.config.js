import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			out: 'build'
		}),
		alias: {
			$components: 'src/components',
			$lib: 'src/lib',
			$stores: 'src/stores',
			$utils: 'src/utils'
		}
	}
};

export default config;
