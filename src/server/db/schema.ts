import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  int,
  json,
  mysqlTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `todo-app_${name}`);

export const statuses = mysqlTable(
  "status",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    title: varchar("name", { length: 256 }),
    createdById: varchar("createdById", { length: 255 }).notNull(),
    createdForCategoryId: bigint("createdForCategoryId", {
      mode: "number",
    }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (example) => ({
    createdByIdIdx: index("createdById_idx").on(example.createdById),
    titleIndex: index("name_idx").on(example.title),
    createdForCategoryIdIdx: index("createdForCategoryId_idx").on(
      example.createdForCategoryId,
    ),
  }),
);

export const statusesRelations = relations(statuses, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [statuses.createdById],
    references: [users.id],
  }),
  createdForCategory: one(categories, {
    fields: [statuses.createdForCategoryId],
    references: [categories.id],
  }),
  todos: many(todos),
}));

export const todos = mysqlTable(
  "todo_item",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    title: varchar("name", { length: 256 }),
    description: json("description"),
    createdById: varchar("createdById", { length: 255 }).notNull(),
    categoryId: bigint("categoryId", { mode: "number" }).notNull(),
    statusId: bigint("statusId", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (example) => ({
    createdByIdIdx: index("createdById_idx").on(example.createdById),
    categoryIdIdx: index("categoryId_idx").on(example.categoryId),
    titleIndex: index("name_idx").on(example.title),
    statusIdIdx: index("statusId_idx").on(example.statusId),
  }),
);

export const todosRelations = relations(todos, ({ one }) => ({
  createdBy: one(users, {
    fields: [todos.createdById],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [todos.categoryId],
    references: [categories.id],
  }),
  status: one(statuses, {
    fields: [todos.statusId],
    references: [statuses.id],
  }),
}));

export const categories = mysqlTable(
  "category",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    title: varchar("name", { length: 256 }),
    color: varchar("color", { length: 30 }),
    icon: varchar("icon", { length: 30 }),
    createdById: varchar("createdById", { length: 255 }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.title),
    createdByIdIdx: index("createdById_idx").on(example.createdById),
  }),
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [categories.createdById],
    references: [users.id],
  }),
  todos: many(todos),
}));

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  categories: many(categories),
  statuses: many(statuses),
  todos: many(todos),
}));

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  }),
);
