---
title: Component showcase
description: Every MDX component this site ships, on one page, with filler copy around it. Kept as a draft so it never reaches the feed.
date: 2026-08-28
image: /images/renoir-moulin-de-la-galette.jpg
draft: true
---

<MP3 src="/audio/the-engineers-proclivity-for-perfection.mp3" />

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus
error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque
ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta
sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed
quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque
porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci
velit.

## Admonitions

Every callout variant, driven by the `--note-*` palette. Severity is carried by
the wash alone, with no icon and no border.

<Callout type="note">

**Note.** At vero eos et accusamus et iusto odio dignissimos ducimus qui
blanditiis praesentium voluptatum deleniti atque corrupti.

</Callout>

<Callout type="info">

**Info.** Temporibus autem quibusdam et aut officiis debitis aut rerum
necessitatibus saepe eveniet ut et voluptates repudiandae sint.

</Callout>

<Callout type="success">

**Success.** Nam libero tempore, cum soluta nobis est eligendi optio cumque
nihil impedit quo minus id quod maxime placeat facere possimus.

</Callout>

<Callout type="warning">

**Warning.** Itaque earum rerum hic tenetur a sapiente delectus, ut aut
reiciendis voluptatibus maiores alias consequatur.

</Callout>

<Callout type="caution">

**Caution.** Quis autem vel eum iure reprehenderit qui in ea voluptate velit
esse quam nihil molestiae consequatur.

</Callout>

<Callout type="danger">

**Danger.** Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis
suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.

</Callout>

<Callout type="inverse">

**Inverse.** Ink on paper, flipped. At vero eos et accusamus et iusto odio
dignissimos ducimus.

</Callout>

<Callout type="highlight">

**Highlight.** The acid green, used sparingly. Neque porro quisquam est qui
dolorem ipsum quia dolor sit amet.

</Callout>

## Video and audio

Media sits in the flow beneath the text by default. Lorem ipsum dolor sit amet,
consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
dolore magna aliqua.

<YouTube videoId="T-j01uhSdGo" />

Pass `class="media-aside"` to float it into the right column instead. Sed ut
perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et
quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem
quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni
dolores eos qui ratione voluptatem sequi nesciunt.

<YouTube videoId="T-j01uhSdGo" class="media-aside" />

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et
dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum
exercitationem ullam corporis suscipit laboriosam.

A local video file, with a poster frame reserved against layout shift:

<MP4 src="/projects/biscuit.mp4" poster="/projects/biscuit-poster.jpg" muted loop />

And a Spotify embed, which resolves its own type from the id:

<Spotify id="4cOdK2wGLETKBW3PvgPWqT" />

## Images

A plain markdown image becomes a zoomable figure. Click it.

![Renoir, Dance at Le Moulin de la Galette](/images/renoir-moulin-de-la-galette.jpg)

<ZoomImage
	src="/images/monet-impression-sunrise.jpg"
	alt="Monet, Impression, Sunrise"
	caption="The same component, called directly so it can carry a caption."
/>

Full bleed runs edge to edge on a phone and sits in the column like any other
image on desktop:

<FullBleed>
	<img src="/images/degas-ballet-rehearsal.jpg" alt="Degas, Ballet Rehearsal" />
</FullBleed>

Pass `wide` to bleed to the viewport edge on desktop too. Either way it only
bleeds when the media is landscape:

<FullBleed wide>
	<img src="/images/renoir-moulin-de-la-galette.jpg" alt="Renoir, full width" />
</FullBleed>

A portrait source stays in the column, `wide` or not:

<FullBleed wide>
	<img src="/icons/512x512.png" alt="A square test tile" />
</FullBleed>

<Caption>Full-bleed artwork, with a caption underneath.</Caption>

## Quotes

> A plain markdown blockquote. Quis autem vel eum iure reprehenderit qui in ea
> voluptate velit esse quam nihil molestiae consequatur.

<StyledQuote href="https://en.wikipedia.org/wiki/Lorem_ipsum">

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
doloremque laudantium, totam rem aperiam.

</StyledQuote>

<QuoteAttribution author="Cicero" source="De Finibus Bonorum et Malorum" />

## Code

Inline `const answer = 42` sits in the run of text. A fenced block gets Shiki
highlighting and a copy button:

```ts
interface Post {
	slug: string;
	title: string;
	date: string;
}

export function sortByDate(posts: Post[]): Post[] {
	return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}
```

```bash
bun run dev
curl -s localhost:4567/rss.xml | xmllint --noout -
```

## Steps

<Steps>
	<Step>

**Install the dependencies.** Lorem ipsum dolor sit amet, consectetur adipiscing
elit, sed do eiusmod tempor.

    </Step>
    <Step>

**Run the dev server.** Ut enim ad minim veniam, quis nostrud exercitation
ullamco laboris nisi ut aliquip.

    </Step>
    <Step>

**Ship it.** Duis aute irure dolor in reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur.

    </Step>

</Steps>

## Cards

<LinkedCard href="/blog/winds-of-winter-preview-chapters">

**Winds of Winter preview chapters** — an internal card, styled as a block link.

</LinkedCard>

<OgCard url="https://svelte.dev" />

<XCard id="20" caption="The first post on the platform." />

## Tables and lists

| Component   | Prop      | Default |
| ----------- | --------- | ------- |
| `YouTube`   | `videoId` | —       |
| `Spotify`   | `id`      | —       |
| `MP4`       | `src`     | —       |
| `Callout`   | `type`    | `note`  |
| `FullBleed` | `wide`    | `false` |

- Lorem ipsum dolor sit amet
- Consectetur adipiscing elit
  - Sed do eiusmod tempor
  - Incididunt ut labore
- Et dolore magna aliqua

1. Ut enim ad minim veniam
2. Quis nostrud exercitation
3. Ullamco laboris nisi

## Maths

Inline maths runs at the paragraph's own size, like $E = mc^2$ in the middle of
a sentence. Block maths sits a touch larger:

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

## Footnotes

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.<Ref id="1" />
Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi
nesciunt.<Ref id="2" />

<FootNotes>
	<FootNote id="1">
		The first note. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
	</FootNote>
	<FootNote id="2">
		The second note, with <a href="https://en.wikipedia.org/wiki/Lorem_ipsum">a link</a> in it.
	</FootNote>
</FootNotes>
