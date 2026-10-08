import type {MetadataRoute} from 'next';
import {SITE_ORIGIN} from '@/lib/seo';
export default function sitemap():MetadataRoute.Sitemap{return [{url:SITE_ORIGIN+'/'},{url:SITE_ORIGIN+'/explore'}]}
