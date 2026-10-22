// Keep the existing parameterized SQL contract during the SQLite to Postgres migration.
export function postgresSQL(sql:string){
 let converted=sql.replace(/json_extract\((\w+),'\$\.(draft|pricePending|partnerWardrobe)'\)/g,(_,column,key)=>`(CASE WHEN ${column}::jsonb->>'${key}'='true' THEN 1 ELSE 0 END)`);
 converted=converted.replace("json_each(CASE WHEN json_valid(photos) THEN photos ELSE '[]' END)","jsonb_array_elements_text(photos::jsonb) AS photo_values(value)");
 let index=0;
 return converted.replace(/'(?:''|[^'])*'|\b(?:ownerName|userId|renterName|actorName|moderationReason|end)\b|\?/g,token=>token.startsWith("'")?token:token==='?'?'$'+(++index):'"'+token+'"');
}
