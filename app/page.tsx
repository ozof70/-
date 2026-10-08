import Home from './home';
import {siteGraph} from '@/lib/seo';
export default function Page(){return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(siteGraph).replace(/</g,'\\u003c')}}/><Home/></>}
