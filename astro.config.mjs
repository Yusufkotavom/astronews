// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import vercel from '@astrojs/vercel';
import partytown from '@astrojs/partytown';
import robots from 'astro-robots';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    mdx({
      // MDX configuration
      syntaxHighlight: 'prism',
      remarkPlugins: [],
      rehypePlugins: [],
      // Enable frontmatter validation
      frontmatter: {
        // Define required frontmatter fields
        required: ['title'],
        // Define optional frontmatter fields with defaults
        optional: {
          description: '',
          author: 'Kotacom Team',
          publishDate: new Date().toISOString(),
          category: 'General',
          tags: [],
          image: '',
          featured: false,
          draft: false
        }
      }
    }),
    icon({
      include: {
        // Include specific icon sets you want to use
        mdi: ['*'], // Material Design Icons
        tabler: ['*'], // Tabler Icons
      },
    }),
    sitemap({
      filter: (page) => {
        // Include all pages except admin or private pages
        return !page.includes('/admin') && !page.includes('/private');
      },
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize: (item) => {
        // Customize sitemap entries based on page type
        if (item.url.includes('jasa-pembuatan-website')) {
          return {
            ...item,
            priority: 0.9
          };
        }
        return item;
      }
    }),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
    robots({
      host: 'www.kotacom.id',
      sitemap: true,
      policy: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/admin/', '/private/', '/api/'],
        },
        {
          userAgent: 'GPTBot',
          disallow: '/',
        },
        {
          userAgent: 'ChatGPT-User',
          disallow: '/',
        },
        {
          userAgent: 'CCBot',
          disallow: '/',
        },
        {
          userAgent: 'anthropic-ai',
          disallow: '/',
        },
        {
          userAgent: 'Claude-Web',
          disallow: '/',
        },
        {
          userAgent: 'Omgilibot',
          disallow: '/',
        },
      ],
    }),
  ],


  // Markdown configuration
  markdown: {
    syntaxHighlight: 'prism',
    remarkPlugins: [],
    rehypePlugins: [],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },

  output: 'static', // Use static output for better performance
  adapter: vercel({
    // Static site configuration
    maxDuration: 30
  }),
  build: {
    assets: 'assets',
    inlineStylesheets: 'auto'
  },
  site: 'https://www.kotacom.id',
  server: {
    host: '0.0.0.0',
    port: 4321,
  },
  // Optimize file watching for large projects
  vite: {
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['tailwindcss']
          }
        }
      },
      minify: 'terser',
      // Performance optimizations
      target: 'esnext',
      cssCodeSplit: true,
      sourcemap: false
    },
    ssr: {
      noExternal: ['flowbite']
    },
    optimizeDeps: {
      include: ['tailwindcss'],
      exclude: ['@astrojs/partytown']
    },
    // Performance optimizations
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    },
    // Performance optimizations
    css: {
      devSourcemap: false
    },
    // Optimize file watching
    server: {
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/dist/**',

          '**/.git/**',
          '**/src/content/post/**/*.md',
          '**/src/content/page/**/*.md'

          '**/.git/**'

        ]
      }
    }
  },
  // Performance optimizations - removed outdated experimental flags
});