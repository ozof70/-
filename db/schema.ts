// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const items=sqliteTable('items',{id:text().primaryKey(),owner:text().notNull(),ownerName:text().notNull(),title:text().notNull(),series:text().notNull(),size:text().notNull(),city:text().notNull(),price:integer().notNull(),deposit:integer().notNull(),description:text().notNull(),delivery:text().notNull(),image:text().notNull(),details:text().notNull().default('{}'),photos:text().notNull().default('[]'),created:integer().notNull(),active:integer().notNull().default(1)},t=>[index('idx_items_owner').on(t.owner)]);
export const bookings=sqliteTable('bookings',{id:text().primaryKey(),item:text().notNull().references(()=>items.id),renter:text().notNull(),renterName:text().notNull(),start:text().notNull(),end:text().notNull(),status:text().notNull().default('pending'),total:integer().notNull()},t=>[index('idx_bookings_item_dates').on(t.item,t.start,t.end),index('idx_bookings_renter').on(t.renter)]);
export const users=sqliteTable('users',{id:text().primaryKey(),email:text().notNull(),name:text().notNull(),created:integer().notNull()});
export const sessions=sqliteTable('sessions',{hash:text().primaryKey(),userId:text().notNull().references(()=>users.id),expires:integer().notNull()},t=>[index('idx_sessions_expires').on(t.expires)]);
export const oauthAttempts=sqliteTable('oauth_attempts',{hash:text().primaryKey(),verifier:text().notNull(),nonce:text().notNull(),expires:integer().notNull()},t=>[index('idx_oauth_attempts_expires').on(t.expires)]);

export const itemModeration=sqliteTable('item_moderation',{item:text().primaryKey().references(()=>items.id),reason:text().notNull(),actor:text().notNull().references(()=>users.id),updated:integer().notNull()});
export const adminAudit=sqliteTable('admin_audit',{id:text().primaryKey(),actor:text().notNull().references(()=>users.id),action:text().notNull(),target:text().notNull(),reason:text().notNull(),created:integer().notNull()},t=>[index('idx_admin_audit_created').on(t.created)]);
