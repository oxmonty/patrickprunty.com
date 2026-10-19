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

## Obsidian

Posts are written in an Obsidian vault, and the repo mirrors it. `obsidian.yaml` names the vault
folder and which of its subfolders become `/blog` and `/code`; each note's file name is the slug.

```sh
make sync     # mirror the vault into src/routes
```

The dev server runs the same sync whenever a note changes, so saving in Obsidian hot-reloads the
post. The pre-push hook runs it too, and stops the push if the vault had changes the repo did not,
so they can be committed first. Deleting a note deletes the post, and `draft: true` in a note's
properties keeps it out of a build.
