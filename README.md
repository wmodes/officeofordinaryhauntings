# Office of Ordinary Hauntings

Source for [officeofordinaryhauntings.net](https://officeofordinaryhauntings.net/).

The Office is an independent research body engaged in the systematic observation,
measurement, and classification of anomalous behavior in ordinary objects. This
repository holds its public web presence. Please direct inquiries through
Form 27-B/6.

## Layout

```
pages/                        Built pages (plain HTML), served as the site root: /about.html
css/  js/  img/               Styles, scripts, images, served at /css/, /js/, /img/
sources/                      One file per page: its <main> content + front matter
elements/                     Shared pieces: layout.html and the partials it includes
scripts/                      build.js, deploy.sh
setupfiles/                   Server config (Caddy site file)
```

Caddy serves `pages/` as the document root (so `pages` never appears in a URL)
plus an allow-list of `css/`, `js/`, and `img/`. Everything else in the repo,
including `sources/`, `elements/`, `scripts/`, `setupfiles/`, and `.git`, sits
outside both and cannot be requested.

## Editing

Edit the files in `sources/` (page content) and `elements/` (header, menu,
widgets, footer), never the built pages in `pages/`, then rebuild:

```sh
node scripts/build.js
```

No dependencies; Node 18+ is enough. To add a page, create `sources/name.html`
starting with a front-matter comment (`title:` and `description:`), and add a
link in `elements/menu.html`. Commit the built pages along with the sources: the
server only does a `git pull`.

To preview, serve the repo root with any static server, for example
`python3 -m http.server`, and open `/pages/`. (Pages link to assets with
root-absolute URLs like `/css/main.css`, so the repo root, not `pages/`, must be
the server root.)

## Deploying

```sh
git push
scripts/deploy.sh
```

The script rebuilds, refuses to continue if anything is uncommitted or unpushed,
then runs `git pull --ff-only` on the server.

## Server setup (one time)

The site is served by Caddy on wmod.es, alongside other sites, so check before
reloading and never restart:

```sh
git clone https://github.com/wmodes/officeofordinaryhauntings.git ~/officeofordinaryhauntings
sudo ln -sf ~/officeofordinaryhauntings/setupfiles/officeofordinaryhauntings.caddy /etc/caddy/sites/officeofordinaryhauntings.caddy
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

DNS (Gandi): `A` and `AAAA` on the apex pointing at the server, and `www` as a
`CNAME` to the apex. The singular domain `officeofordinaryhaunting.net` needs the
same apex records so it can redirect.
