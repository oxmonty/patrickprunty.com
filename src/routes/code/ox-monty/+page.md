---
title: OX MONTY
description: The org everything I build ships under, and what each piece is actually for
date: 2026-08-17
image: /images/ox-monty.png
---

<!-- TODO: the framing paragraph below is a placeholder — replace with how you
     actually describe OX MONTY. Everything under "What is in it" is drawn from
     the repos themselves and should be accurate. -->

OX MONTY is the org the work ships under. It is less a company than a shared
roof: a handful of tools that solve problems I kept hitting, released rather
than kept in a drawer.

## What is in it

### Biscuit

Generates production-ready CLI repositories from OpenAPI specs. Every generated
CLI is also an MCP server and a chat TUI, so one spec gives you three interfaces
rather than one. Written in Go, released under GPL-2.0.

<Callout type="info">

The interesting constraint is that the generated repo has to be a real project —
CI, releases, tests — not a scaffold you immediately start fighting.

</Callout>

### Yoshi

A native Jupyter notebook desktop app for macOS and Linux, GPU-rendered, built
in Rust on GPUI. The bet is that notebooks are an interface problem before they
are a kernel problem, and that native rendering is what makes them feel like a
tool rather than a web page in a window.

### Lotso

Storyboarding for LLM-generated video. Scenes get generated with a model,
arranged on an infinite pan and zoom canvas inside fixed-size frames, then
exported as clips to assemble in a real editor.

<Callout type="warning">

Deliberately not a video editor. The loop is generate, arrange, export, then
hand off to CapCut or Final Cut — trying to be the editor too is how this class
of tool dies.

</Callout>

### Doto and Console

Doto is a task app; Console is an open-source alternative to Vercel with Google
Cloud Platform integration.

## The common thread

Each of these started as something I wanted to exist and could not find, or
found and did not like. That is a bad reason to start a company and a good
reason to write software.

<Callout type="highlight">

The whole set is on [GitHub](https://github.com/oxmonty) — issues and pull
requests welcome on any of them.

</Callout>
