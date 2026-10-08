import {database} from '@/db/raw';
export const dynamic='force-dynamic';
export async function GET(){try{await database().prepare('SELECT COUNT(*) AS count FROM app_migrations').first();return Response.json({status:'ok'})}catch{return Response.json({status:'unavailable'},{status:503})}}
