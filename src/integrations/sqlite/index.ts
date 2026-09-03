import { open } from "@op-engineering/op-sqlite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/op-sqlite";
import { useMigrations } from "drizzle-orm/op-sqlite/migrator";
import { useEffect } from "react";
import { create } from "zustand";

import { Logger } from "@/services/logger";
import migrations from "@/sqlite/drizzle/migrations";
import * as schema from "@/sqlite/schema";

const SQLITE_DATABASE_NAME = "hair_try_on.db";

const opsqlite = open({ name: SQLITE_DATABASE_NAME });

export const sqliteDb = drizzle(opsqlite, { schema });

export type MigrationState =
  { status: "pending" } | { status: "ready" } | { status: "error"; error: Error };

interface SQLiteStore {
  migration: MigrationState;
  setMigration: (migration: MigrationState) => void;
  completeMigrations: () => Promise<void>;
}

export const useSQLiteStore = create<SQLiteStore>((set) => ({
  migration: { status: "pending" },
  setMigration: (migration) => set({ migration }),
  completeMigrations: async () => {
    await markStalePendingGenerationsFailed();
    set({ migration: { status: "ready" } });
  },
}));

export function useMigrationsInitializer() {
  const { success, error } = useMigrations(sqliteDb, migrations);

  useEffect(() => {
    if (error) {
      Logger.error(error, { message: "SQLite migration failed" });
      useSQLiteStore.getState().setMigration({ status: "error", error });
      return;
    }

    if (success) {
      useSQLiteStore.getState().completeMigrations();
    }
  }, [success, error]);
}

async function markStalePendingGenerationsFailed() {
  await sqliteDb
    .update(schema.hairGenerations)
    .set({ status: "failed" })
    .where(eq(schema.hairGenerations.status, "pending"));
}
