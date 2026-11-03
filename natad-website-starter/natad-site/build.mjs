import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const all = (folder) => fs.existsSync(path.join(root, folder))
  ? fs.readdirSync(path.join(root, folder))
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({ ...read(`${folder}/${file}`), slug: path.basename(file, '.json') }))
  : [];
const s = read('content/site.json');
const projects = all('content/projects').filter((p) => p.published !== false);
const updates = all('content/updates').filter((u) => u.published !== false)
  .sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')));

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[ch]));
const safeUrl = (value) => {
  const str = String(value ?? '').trim();
  return /^(https:\/\/|\/(?!\/))/i.test(str) ? esc(str) : '';
};
const safeImage = (value) => {
  const str = typeof value === 'string' ? value : (value?.src ?? value?.url ?? '');
  return safeUrl(str);
};
const galleryImages = (project) => (Array.isArray(project.gallery) ? project.gallery : [])
  .map(safeImage).filter(Boolean);
const calendarUrl = (() => {
  try {
    const url = new URL(String(s.calendar_url ?? '').trim());
    // Public Google Calendar embeds only; avoid embedding arbitrary URLs from editable content.
    if (url.protocol !== 'https:' || url.hostname !== 'calendar.google.com' ||
        !/^\/calendar\/(?:embed|u\/\d+\/embed)$/.test(url.pathname)) return '';
    return esc(url.toString());
  } catch { return ''; }
})();
const section = (value) => `<div class="eyebrow">${esc(value)}</div>`;
const headerLogo = safeImage(s.header_logo ?? s.logo);
const footerLogo = safeImage(s.footer_logo);
const favicon = safeImage(s.favicon);

const siteNav = `<header class="site-header"><div class="wrap nav"><a class="brand" href="/">${headerLogo
  ? `<img class="natad-header-logo" src="${headerLogo}" alt="NATAD logo">`
  : '<span class="brand-mark">N<span>·</span></span>'}<span>NATAD<small>COMMUNITY & PROJECTS</small></span></a><nav aria-label="Main navigation"><a href="/#about">About</a><a href="/#projects">Projects</a><a href="/#updates">Updates</a>${calendarUrl ? '<a href="/#events">Events</a>' : ''}<a class="nav-contact" href="/#contact">Get in touch ↗</a></nav></div></header>`;
const footer = `<footer class="footer"><div class="wrap foot"><div>${footerLogo
  ? `<img class="natad-footer-logo" src="${footerLogo}" alt="NATAD logo">`
  : '<div class="footbrand">NATAD<span>.</span></div>'}<p>${esc(s.footer_text)}</p></div><div class="footlinks"><a href="/#about">About</a><a href="/#projects">Projects</a>${calendarUrl ? '<a href="/#events">Events</a>' : ''}<a href="/#contact">Contact</a></div><div>© ${new Date().getFullYear()} NATAD<br><span>Made for the work that matters.</span></div></div></footer>`;

// Small additive styles; the site's existing public/styles.css remains unchanged.
const featureCss = `<style>
.natad-header-logo{display:block;max-width:132px;max-height:60px;width:auto;height:auto;object-fit:contain}
.natad-footer-logo{display:block;max-width:180px;max-height:90px;width:auto;height:auto;object-fit:contain;margin-bottom:1rem}
.project-gallery{margin-top:2rem}.project-gallery h2{font-size:1.5rem;margin-bottom:1rem}
.project-gallery-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
.project-gallery-grid a{display:block;overflow:hidden;border-radius:12px;background:#e5eee9;aspect-ratio:4/3}
.project-gallery-grid img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .2s}
.project-gallery-grid a:hover img{transform:scale(1.035)}
.events-section{padding:5rem 0;background:#f6f7f3}
.events-section h2{margin:0 0 1rem}.events-section p{margin:0 0 1.5rem}
.natad-calendar-frame{width:100%;height:620px;max-width:100%;border:0;border-radius:14px;background:#fff}
@media(max-width:640px){.natad-calendar-frame{height:480px}.natad-header-logo{max-width:90px;max-height:44px}}
</style>`;
const layout = (title, desc, body) => `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(desc)}"><meta name="theme-color" content="#173d31"><title>${esc(title)} | NATAD</title>${favicon ? `<link rel="icon" href="${favicon}">` : ''}<link rel="stylesheet" href="/styles.css">${featureCss}</head><body>${siteNav}<main>${body}</main>${footer}</body></html>`;

function projectCard(p) {
  const image = safeImage(p.image);
  return `<a class="project-card" href="/projects/${encodeURIComponent(p.slug)}/"><div class="project-art">${image
    ? `<img src="${image}" alt="${esc(p.title)}" loading="lazy">`
    : `<span class="decor-orbit">↗</span><span class="art-label">${esc(p.category || 'OUR WORK')}</span>`}</div><div class="project-info"><div class="meta">${esc(p.category || 'Initiative')}${p.location ? ' · ' + esc(p.location) : ''}</div><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p><span class="linkline">Explore project <span>↗</span></span></div></a>`;
}
const cards = projects.length ? projects.map(projectCard).join('') : '<p>Project stories will appear here soon.</p>';
const updateCards = updates.length ? updates.slice(0, 3).map((u) => `<a class="update" href="/updates/${encodeURIComponent(u.slug)}/"><span class="date">${esc(u.date || 'Update')}</span><div><h3>${esc(u.title)}</h3><p>${esc(u.summary)}</p></div><span class="arrow">↗</span></a>`).join('') : '<p>Updates will appear here soon.</p>';
const form = `<form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" action="/thanks/"><input type="hidden" name="form-name" value="contact"><p class="hidden"><label>Leave this blank <input name="bot-field"></label></p><div class="form-grid"><label>Your name<input required maxlength="100" name="name" autocomplete="name" placeholder="Your name"></label><label>Email address<input required type="email" maxlength="200" name="email" autocomplete="email" placeholder="you@example.com"></label></div><label>What would you like to discuss?<select name="interest"><option>General inquiry</option><option>Partnership</option><option>Volunteer</option><option>Project information</option></select></label><label>Message<textarea required name="message" rows="5" maxlength="5000" placeholder="Tell us a little about your inquiry..."></textarea></label><label class="consent"><input type="checkbox" required name="privacy-consent" value="yes"><span>I agree that NATAD may use my details to respond to my inquiry.</span></label><button type="submit" class="btn dark">Send message <span>↗</span></button></form>`;
const hero = `<section class="hero"><div class="wrap hero-inner"><div class="hero-copy">${section(s.kicker)}<h1>${esc(s.hero_title)}<em>${esc(s.hero_emphasis)}</em></h1><p>${esc(s.hero_description)}</p><div class="actions"><a class="btn" href="#projects">Explore our work <span>↗</span></a><a class="text-link" href="#about">Learn about us <span>↗</span></a></div><div class="hero-note"><span class="note-line"></span> Rooted in community. Focused on impact.</div></div><div class="hero-visual" aria-label="Abstract green botanical illustration"><span class="circle c1"></span><span class="circle c2"></span><span class="leaf leaf1"></span><span class="leaf leaf2"></span><span class="leaf leaf3"></span><span class="visual-caption">IDEAS INTO<br><strong>ACTION.</strong></span><span class="visual-coordinate">NATAD / INITIATIVES</span></div></div></section>`;
const eventsSection = calendarUrl ? `<section id="events" class="events-section"><div class="wrap">${section('04 / ACTIVITIES')}<h2>Upcoming events.</h2><p>Stay up to date with NATAD activities, gatherings, and project events.</p><iframe class="natad-calendar-frame" src="${calendarUrl}" title="NATAD public events calendar" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div></section>` : '';
const home = hero + `<section id="about" class="section intro"><div class="wrap split">${section('01 / WHO WE ARE')}<div><h2>${esc(s.about_heading)}</h2><p class="lead">${esc(s.about_text)}</p><a class="under-link" href="#contact">Start a conversation ↗</a></div></div></section><section id="projects" class="section projects-section"><div class="wrap"><div class="section-heading">${section('02 / OUR PROJECTS')}<div class="heading-row"><h2>Work in progress.<br><em>Change in motion.</em></h2><p>Explore the initiatives and ideas we're working on. Each has a story, a purpose, and room to grow.</p></div></div><div class="project-grid">${cards}</div></div></section><section class="statement"><div class="wrap"><span>OUR APPROACH</span><p>Good work begins with <em>people</em>, grows through <em>partnership</em>, and lasts through <em>commitment</em>.</p></div></section><section id="updates" class="section updates-section"><div class="wrap"><div class="section-heading">${section('03 / LATEST NEWS')}<h2>From the field.</h2></div><div class="updates">${updateCards}</div></div></section>${eventsSection}<section id="contact" class="section contact-section"><div class="wrap contact-grid"><div>${section(calendarUrl ? '05 / CONNECT WITH US' : '04 / CONNECT WITH US')}<h2>Let's make<br><em>something matter.</em></h2><p>Have a question, an idea, or an opportunity to collaborate? We'd love to hear from you.</p>${s.contact_email ? `<p class="email-line">${esc(s.contact_email)}</p>` : ''}</div><div class="form-panel"><h3>Send us a message</h3>${form}</div></div></section>`;

function write(p, html) {
  const destination = path.join(out, p);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, html);
}
const paragraphs = (value) => esc(value).split(/\n\n+/).map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
write('index.html', layout('Community, projects & progress', s.hero_description, home));
for (const p of projects) {
  const cover = safeImage(p.image);
  const gallery = galleryImages(p);
  const galleryHtml = gallery.length ? `<section class="project-gallery"><h2>Project photo gallery</h2><div class="project-gallery-grid">${gallery.map((image, index) => `<a href="${image}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(p.title)} photo ${index + 1}"><img src="${image}" alt="${esc(p.title)} — photo ${index + 1}" loading="lazy"></a>`).join('')}</div></section>` : '';
  write(`projects/${p.slug}/index.html`, layout(p.title, p.summary, `<article class="detail wrap"><a class="back" href="/#projects">← All projects</a>${section(p.category || 'PROJECT')}<h1>${esc(p.title)}</h1><p class="detail-lead">${esc(p.summary)}</p>${cover ? `<img class="detail-image" alt="${esc(p.title)}" src="${cover}">` : ''}<div class="detail-columns"><div><div class="meta">${esc(p.location || 'NATAD initiative')}</div></div><div class="prose">${paragraphs(p.body)}<a class="under-link" href="/#contact">Ask about this project ↗</a></div></div>${galleryHtml}</article>`));
}
for (const u of updates) {
  write(`updates/${u.slug}/index.html`, layout(u.title, u.summary, `<article class="detail wrap"><a class="back" href="/#updates">← All updates</a>${section(u.date || 'NEWS')}<h1>${esc(u.title)}</h1><p class="detail-lead">${esc(u.summary)}</p><div class="detail-columns"><div>News & activities</div><div class="prose">${paragraphs(u.body)}</div></div></article>`));
}
write('thanks/index.html', layout('Thank you', 'Your message has been submitted.', `<section class="wrap thankyou"><div class="eyebrow">MESSAGE SENT</div><h1>Thank you for reaching out.</h1><p>We have received your inquiry. Our team will review it and respond when possible.</p><a class="btn dark" href="/">Back to homepage ↗</a></section>`));
for (const file of ['styles.css', 'robots.txt']) {
  const source = path.join(root, 'public', file);
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(out, file));
}
if (fs.existsSync(path.join(root, 'media'))) fs.cpSync(path.join(root, 'media'), path.join(out, 'media'), { recursive: true });
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', ...projects.map((p) => `/projects/${p.slug}/`), ...updates.map((u) => `/updates/${u.slug}/`)].map((url) => `<url><loc>https://natad-vnte.org${url}</loc></url>`).join('')}</urlset>`);
console.log(`Built NATAD: ${projects.length} projects, ${updates.length} updates${calendarUrl ? ', calendar enabled' : ''} → dist/`);
