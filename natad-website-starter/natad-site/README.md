# NATAD website starter — natad-vnte.org

A free, dependency-free, static project website built with Node.js and designed for Netlify + Pages CMS.

## Website pages
- Home, About, Projects, News, Contact
- Automatic project and news detail pages
- Netlify contact form (works once deployed and form detection enabled)
- Responsive layout, SEO sitemap, HTTPS via Netlify

## Preview locally
Install Node.js 20 or newer. In this folder, run:

```sh
node build.mjs
npx serve dist
```

Or open the generated `dist/index.html` (some local navigation links will need an HTTP server).

## Set up GitHub & Netlify
1. Create a new **public** GitHub repository called `natad-website` (public allows multiple GitHub contributors on Netlify Free; do not put secrets in the repository).
2. Upload all files from this folder, INCLUDING `.pages.yml` and `netlify.toml`, to repository root. Do **not** upload only `dist` — the CMS edits source files.
3. At https://app.netlify.com choose Add new project / Import an existing project / GitHub; authorize repository.
4. Netlify reads `netlify.toml`: build command `node build.mjs`, publish directory `dist`.
5. Deploy. Preview at the assigned `*.netlify.app` URL.
6. In Netlify, add `natad-vnte.org` and `www.natad-vnte.org` as custom domains. Keep domain DNS on Namecheap unless you intentionally want to migrate it.
7. If Namecheap is authoritative DNS: add root `A` record with host `@` and value `75.2.60.5`, and a `www` CNAME to the specific `*.netlify.app` hostname assigned by Netlify. Follow any domain-specific instructions shown in Netlify (and remove conflicting web A/AAAA/CNAME or URL-redirect records only; preserve MX/TXT mail records). SSL is issued by Netlify after verification.
8. In Netlify > Forms, **Enable form detection**, then trigger a fresh deploy. Submit a test message and configure email notification if desired.

## Set up Pages CMS
1. Open https://app.pagescms.org and sign in with GitHub.
2. Install the Pages CMS GitHub App for your repository.
3. Select the `natad-website` repository. It will read `.pages.yml` and show Homepage, Projects, and News.
4. Edit text, upload media, and save. Pages CMS commits changes to GitHub; Netlify automatically rebuilds the site.
5. Invite editors using Pages CMS's team invite facility / suitable GitHub access. Grant only trusted editors access to publish. Test their permissions before rollout.

## Before going live
- Replace example project and announcement, and delete sample entries if not relevant.
- Replace placeholder about text with the approved NATAD mission and organization description.
- Add verified contact details, real project images, and privacy policy/notice appropriate for contact form collection.
- Set form notification email, test Netlify forms and both www/non-www redirects.
- Ensure DNS is administered at the correct provider; Namecheap Advanced DNS is only effective for its active nameservers.

## Notes
- Files in `content/site.json`, `content/projects/`, and `content/updates/` are the content source. `dist/` is rebuilt automatically and should not be edited.
- Uploaded photos are stored in `media/` in the repository. Keep them compressed (ideally WebP/JPEG) to keep the repository lightweight.
- Neither the website nor the contact form runs locally with full Netlify functionality; contacts are stored in Netlify Forms only after deployment.
- Hosting and CMS are free within providers' published limits, not an uptime guarantee.
