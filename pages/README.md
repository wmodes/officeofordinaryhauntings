# pages/ is generated. Do not edit files here.

This folder holds the **built** pages of the site. It is the web server's
document root, so `pages/about.html` is served as `/about.html` (the `pages`
segment never appears in a URL).

Every `.html` file here is written by `scripts/build.js`. Edits made directly
to these files are **overwritten on the next build**.

## To change a page

| To change...                          | Edit...                              |
| ------------------------------------- | ------------------------------------ |
| A page's content, title, description  | `sources/<page>.html`                |
| The header, menu, widgets, or footer  | `elements/*.html`                    |
| The page skeleton (`<head>`, scripts) | `elements/layout.html`               |
| Styles, scripts, images               | `css/`, `js/`, `img/` (repo root)    |

Then rebuild and commit the result (the server only does a `git pull`):

```sh
node scripts/build.js
```

## Not served

`README.md` and `DO_NOT_MODIFY_FILES_HERE.txt` live here for developers. The
Caddy site file (`setupfiles/officeofordinaryhauntings.caddy`) returns 404 for
both. If you add another developer-only file to this folder, add it to the
`@devnotes` matcher in that file too, or it will be public.
