# Gmail filter XML

Tracked Gmail “Settings → Filters → Import” files live in **`public/`**. CI attaches them to the GitHub Release for the version in **`RELEASE_VERSION`**.

## Version and releases

**`RELEASE_VERSION`** is one line: either **`1.2.3`** or **`v1.2.3`**. If there is no leading **`v`**, the workflow adds it for the GitHub release tag.

When **`public/**`** or **`RELEASE_VERSION`** changes on **`main`**, the workflow uploads every tracked file under **`public/`** to that release (and creates the release if needed).

Re-run anytime: **Actions → Publish public XML → Run workflow** (still uses **`RELEASE_VERSION`** only).

## Build source

Filter definitions and the generator live in a **separate private** repository.
