import {z} from 'zod';

export const rentalListingSchema=z.object({
 title:z.string().trim().min(2).max(80),series:z.string().trim().min(1).max(60),
 ownerName:z.string().trim().min(1).max(30),size:z.enum(['XS','S','S/M','M','M/L','L','L/XL','XL','2XL','其他']),
 city:z.string().trim().min(1).max(30),price:z.coerce.number().int().min(1).max(50000),
 deposit:z.coerce.number().int().min(0).max(100000),
 description:z.string().trim().min(10).max(2000),delivery:z.enum(['面交','宅配','面交或宅配']),
});

export function isDraft(raw:unknown):boolean{
 try{const value=typeof raw==='string'?JSON.parse(raw):raw;return !!value&&typeof value==='object'&&(value as {draft?:unknown}).draft===true}catch{return false}
}
