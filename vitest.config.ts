import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      name: 'md-string',
      transform(code, id) {
        if (id.endsWith('.md')) {
          return `export default ${JSON.stringify(code)}`;
        }
      },
    },
  ],
  test: {
    include: ['tests/**/*.spec.ts'],
  },
});