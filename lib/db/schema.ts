import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, uuid } from "drizzle-orm/pg-core";

const timestamps = {
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

export const appPrompts = pgTable('app_prompts', {
  id: uuid('id').defaultRandom().primaryKey(),
  heading: varchar('heading', { length: 255 }).notNull(),
  content: text('content').notNull(),
  time_taken_seconds: integer('time_taken_seconds').default(0).notNull(),
  word_count: integer('word_count').default(0).notNull(),
  ...timestamps,
});

export const personalPrompts = pgTable('personal_prompts', {
  id: uuid('id').defaultRandom().primaryKey(),
  heading: varchar('heading', { length: 255 }).notNull(),
  content: text('content').notNull(),
  time_taken_seconds: integer('time_taken_seconds').default(0).notNull(),
  word_count: integer('word_count').default(0).notNull(),
  ...timestamps,
});

export const passwordEntries = pgTable('password_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  application_name: varchar('application_name', { length: 255 }).notNull(),
  username: varchar('username', { length: 255 }).notNull(),
  encrypted_password: text('encrypted_password').notNull(),
  ...timestamps,
});

export const personalFiles = pgTable('personal_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  file_name: varchar('file_name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  storage_mode: varchar('storage_mode', { length: 50 }).notNull(), // 'TEXT' or 'URL'
  file_content: text('file_content').notNull(),
  ...timestamps,
});

export const favoriteCommands = pgTable('favorite_commands', {
  id: uuid('id').defaultRandom().primaryKey(),
  command_name: varchar('command_name', { length: 255 }).notNull(),
  command: text('command').notNull(),
  ...timestamps,
});

export const dashboardApps = pgTable('dashboard_apps', {
  id: uuid('id').defaultRandom().primaryKey(),
  application_name: varchar('application_name', { length: 255 }).notNull(),
  application_url: text('application_url').notNull(),
  icon_url: text('icon_url'),
  sort_order: integer('sort_order').notNull(),
  ...timestamps,
});

export const userSettings = pgTable('user_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  theme_preference: varchar('theme_preference', { length: 50 }).default('system').notNull(),
  quick_nav_settings: jsonb('quick_nav_settings'),
  dashboard_stats_settings: jsonb('dashboard_stats_settings'),
  ...timestamps,
});

export const favouriteCommands = pgTable('favourite_commands', {
  id: uuid('id').defaultRandom().primaryKey(),
  command_name: varchar('command_name', { length: 255 }).notNull(),
  command: text('command').notNull(),
  ...timestamps,
});

