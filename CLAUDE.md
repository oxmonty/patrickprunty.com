# CLAUDE.md

Repo-specific notes. General engineering, commit, and PR conventions live in the global `~/.claude/CLAUDE.md`.

## Dev server

**Reuse the running server. Do not start a second one, and never kill one by pattern.**

Check first, and use it if it answers:

```sh
curl -s -o /dev/null -w "%{http_code}" --max-time 2 http://localhost:4567/
```

`pkill -f "vite dev --port 4567"` is banned. `-f` matches the command line, and `bun run dev` is always `vite dev --port 4567 --host` whatever port Vite actually binds — a second instance auto-increments to 4568 but still reports `--port 4567`. So that pattern kills every Vite process on the machine, including the one the user is working in.

If a server genuinely has to be started, capture its PID at launch and kill only that PID. Leave any server you did not start running.

Most verification here is read-only DOM measuring in the browser, which the user's existing server serves just as well.

## Toolchain

`bun`, not npm. `make help` lists the targets; `make dev`, `make check`, `make lint` wrap the bun scripts.

## Content

Posts are markdown at `src/routes/{blog,code}/<slug>/+page.md`. `draft: true` in the frontmatter keeps one out of a build while leaving it visible in dev (`src/lib/posts.ts`). Projects, links, and feature flags are in `src/lib/config/site.ts`, where `draft` works the same way.
