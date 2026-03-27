# Gmail filter XML

Tracked Gmail “Settings → Filters → Import” files live in **`public/`**. Semver **GitHub Releases** get the same files as uploadable assets.

## Release tag

The workflow reads **`/.release-tag`**: a single line, e.g. `v1.2.0`. When you change exports under **`public/`**, commit those changes; if the release should target a new tag, update **`.release-tag`** in the same commit (or earlier).

On push to **`main`** (only when **`public/**` or `.release-tag`** changes), CI uploads every tracked path under **`public/`** to that release, creating it if it does not exist yet.

You can re-run uploads manually: **Actions → Publish public XML → Run workflow**, optionally overriding the tag.

## Build source

Filter definitions and the generator live in a **separate private** repository.
