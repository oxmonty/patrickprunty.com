---
title: What breaks when you port MDX to mdsvex
description: mdsvex bundles the pre-micromark remark-parse, which means half the plugin ecosystem installs cleanly and then silently does nothing.
date: 2026-08-16
image: /images/renoir-moulin-de-la-galette.jpg
---

The components port fine. The pipeline is where the surprises live.

<Callout type="warning">

**The short version**

If a remark plugin was published after late 2020, it will install without
complaint into mdsvex and then do absolutely nothing. There is no error.

</Callout>

## Plugin versions matter more than they look

`remark-gfm@4`, `remark-math@6`, and `rehype-katex@7` all install cleanly and
then no-op. mdsvex bundles the legacy `remark-parse`, from before the micromark
rewrite, so any plugin built against the newer parser registers extensions
nobody reads.

You can confirm it in about ten seconds:

```bash
grep -c "blockTokenizers" node_modules/mdsvex/dist/main-*.js
```

A hit means the legacy tokenizer, which means the modern plugin generation is
inert. The fix is to take the pre-2021 major:

```javascript
// Works. remark-math@6 does not.
remarkPlugins: [remarkMath]; // v3
```

<Callout>

GFM needs no plugin here at all. Tables and strikethrough are built into that
parser already, which is why the tables kept working while the math silently
did not.

</Callout>

## Braces are Svelte syntax

Markdown is just markup to Svelte, so `{` starts an expression wherever it
appears:

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$

That renders because `remark-math` turns it into HTML before the compiler sees
it. Written as a component attribute instead, the same LaTeX is a compile
error — the braces get read as a template expression and the parser gives up
looking for a Unicode escape.

<Callout type="danger">

**This will not compile**

`<Latex math="e^{i\pi} + 1 = 0" />` — the `{` opens an expression. Inline `$…$`
is the ergonomic answer; the component form needs `math={String.raw`…`}`.

</Callout>

## Components are not in scope by default

mdsvex layouts can substitute _HTML element_ names — an export called `img`
replaces `<img>`. They cannot introduce arbitrary components, so `<YouTube />`
in a markdown file is just an undefined reference.

<Callout type="info">

**The workaround**

A preprocessor that runs before mdsvex injects one import line into every
markdown file, after the frontmatter. Authors get the whole registry with no
imports, and Rollup drops whatever goes unused.

</Callout>

Which is what makes this work, with nothing imported in this file:

https://www.youtube.com/watch?v=dQw4w9WgXcQ

<Caption>A bare URL on its own line, rewritten to a component by a remark plugin.</Caption>

## The one that cost an hour

Pointing the layout at `$lib/components/mdx/post-layout.svelte` works perfectly
in dev and hangs the production build forever — no error, no progress, 0% CPU
at the `transforming` step. An absolute path via `import.meta.dirname` fixes
it.<Ref id="1" />

<FootNotes>
<FootNote id="1">

mdsvex writes the layout path straight into an import in the generated
component. A relative path resolves against the markdown file rather than the
project root, and the alias apparently confuses resolution badly enough to
deadlock rather than fail.

</FootNote>
</FootNotes>
