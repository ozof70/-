import assert from 'node:assert/strict';
const origin=new URL(process.argv[2]||'http://127.0.0.1:5184').origin;
const page=async path=>{const r=await fetch(origin+path);assert.equal(r.status,200,path);return r.text()};
const home=await page('/');assert.match(home,/<title>COZ COS CLOSET.*Cosplay/);assert.match(home,/rel="canonical" href="https:\/\/closet.cozcos.com\/?"/);assert.match(home,/name="description"/);assert.match(home,/Cosplay 服裝租借/);assert.match(home,/property="og:image"/);
const schema=home.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);assert.ok(schema);const graph=JSON.parse(schema[1]);assert.equal(graph['@context'],'https://schema.org');assert.ok(graph['@graph'].some(n=>n['@type']==='WebSite'&&n.name==='COZ COS CLOSET'));
const robots=await page('/robots.txt');assert.match(robots,/Allow: \//);assert.match(robots,/Sitemap: https:\/\/closet.cozcos.com\/sitemap.xml/);assert.doesNotMatch(robots,/Disallow: \/\s*$/m);
const sitemap=await page('/sitemap.xml');assert.equal((sitemap.match(/<loc>/g)||[]).length,5);assert.match(sitemap,/\/about<\/loc>/);assert.match(sitemap,/\/explore<\/loc>/);assert.doesNotMatch(sitemap,/\/admin|\/login|\/api\//);
const explore=await page('/explore');assert.match(explore,/<title>探索 Cosplay/);assert.match(explore,/costume-card/);assert.match(explore,/rel="canonical" href="https:\/\/closet.cozcos.com\/explore"/);
const login=await page('/login');assert.match(login,/name="robots" content="noindex, nofollow"/);assert.doesNotMatch(login,/rel="canonical"/);
const image=await fetch(origin+'/opengraph-image');assert.equal(image.status,200);assert.match(image.headers.get('content-type'),/image\/png/);const bytes=Buffer.from(await image.arrayBuffer());assert.equal(bytes.readUInt32BE(16),1200);assert.equal(bytes.readUInt32BE(20),630);
console.log('PASS SEO: crawlable homepage, unique canonical/title, structured brand data, SSR catalog, robots, sitemap, private-page noindex and 1200x630 share image.');

const website=graph['@graph'].find(n=>n['@type']==='WebSite');assert.ok(website.alternateName.includes('COZ COS'));assert.ok(graph['@graph'].some(n=>n['@type']==='Service'));assert.match(home,/brand-icon\.png/);
const icon=await fetch(origin+'/brand-icon.png');assert.equal(icon.status,200);assert.match(icon.headers.get('content-type'),/image\/png/);const iconBytes=Buffer.from(await icon.arrayBuffer());assert.equal(iconBytes.readUInt32BE(16),512);assert.equal(iconBytes.readUInt32BE(20),512);
const about=await page('/about');assert.match(about,/rel="canonical" href="https:\/\/closet.cozcos.com\/about"/);const faqSchema=JSON.parse(about.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);assert.equal(faqSchema['@type'],'FAQPage');assert.equal(faqSchema.mainEntity.length,6);for(const faq of faqSchema.mainEntity){assert.ok(about.includes(faq.name));assert.ok(about.includes(faq.acceptedAnswer.text));}assert.match(robots,/User-agent: OAI-SearchBot/i);console.log('PASS brand discovery: square favicon, COZ COS aliases, service schema, crawlable FAQ answers and search crawler access.');

for(const path of ['/terms','/privacy']){
 const legal=await page(path);
 assert.ok(legal.includes('href="https://closet.cozcos.com'+path+'"'));
 assert.match(legal,/dennis02101014@gmail\.com/);
 assert.match(legal,/class="legal-sections"/);
 assert.ok(sitemap.includes('https://closet.cozcos.com'+path));
 const en=await fetch(origin+path,{headers:{Cookie:'cos_language=en; cos_theme=light'}}).then(r=>r.text());
 assert.match(en,/Last updated:/);
 assert.match(en,path==='/terms'?/Terms of Service/:/Privacy Policy/);
 assert.match(en,/lang="en"/);
}
console.log('PASS legal pages: public SSR content in both languages, canonical links and sitemap inclusion.');
