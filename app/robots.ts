import type {MetadataRoute} from 'next';
import {SITE_ORIGIN} from '@/lib/seo';
export default function robots():MetadataRoute.Robots{return {
 rules:[{userAgent:'*',allow:'/',disallow:['/admin','/login','/api/auth/','/api/admin','/api/closet','/api/health']},{userAgent:'OAI-SearchBot',allow:'/',disallow:['/admin','/login','/api/auth/','/api/admin','/api/closet','/api/health']}],
 sitemap:SITE_ORIGIN+'/sitemap.xml'
}}
