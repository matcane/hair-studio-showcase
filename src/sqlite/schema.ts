import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type LookStatus = "pending" | "ready" | "failed";

export const hairGenerations = sqliteTable(
  "hair_generations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    status: text("status").notNull().default("pending").$type<LookStatus>(),
    createdAt: integer("created_at").notNull(),
    actionType: text("action_type").notNull(),
    actionId: text("action_id").notNull(),
    actionTitle: text("action_title"),
    styleTexture: text("style_texture"),
    styleLength: text("style_length"),
    beforeFilename: text("before_filename").notNull(),
    afterFilename: text("after_filename"),
  },
  (table) => [index("looks_created_at_idx").on(table.createdAt)],
);

export type LookRow = typeof hairGenerations.$inferSelect;
export type NewLookRow = typeof hairGenerations.$inferInsert;
