<h1>
  <img alt="patrickprunty.com icon" src="./assets/icon.png" width="70" valign="middle">
  &nbsp;patrickprunty.com
</h1>

My personal site. SvelteKit and mdsvex, styled with Tailwind.

```sh
make install
make dev      # http://localhost:4567
```

`make help` lists the rest.

## Writing

Posts are markdown at `src/routes/blog/<slug>/+page.md` and `src/routes/code/<slug>/+page.md`,
with `title`, `description`, `date`, and `image` in the frontmatter. Add `draft: true` to keep
one out of a build while still seeing it in development server.
