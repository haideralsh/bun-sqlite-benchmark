import { randomUUID } from "node:crypto"
import { Database } from "bun:sqlite";

const names = ['Oliver', 'Emma', 'Noah', 'Ava', 'William', 'Sophia', 'James', 'Isabella', 'Benjamin', 'Mia', 'Lucas', 'Charlotte', 'Henry', 'Amelia', 'Alexander', 'Harper', 'Ethan', 'Evelyn', 'Michael', 'Abigail'];

function getName(from = names) {
  const randomIndex = Math.floor(Math.random() * from.length)

  return from[randomIndex]
}

function setup({ reset = false }: { reset?: boolean } = {}) {
  // Create DB
  const db = new Database("mydb.sqlite", { create: true });

  // Create table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id BLOB PRIMARY KEY NOT NULL,
        created_at TEXT NOT NULL,
        username TEXT NOT NULL
    );
  `).run()

  // Create id index
  db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_on_id ON users(id)`).run()

  // Delete everything
  if (reset) {
    db.prepare(`delete from users`).run()
  }

  return db
}

function main() {
  let db = setup()

  let i = 0

  // Benchmark starts here
  let t0 = performance.now();

  while (i < 10000) {
    const query = db.prepare(`INSERT INTO users (id, created_at, username) VALUES (?, ?, ?)`);

    query.run([
      randomUUID(),
      new Date().toUTCString(),
      getName()
    ])

    i++
  }

  let t1 = performance.now();

  let { count } = db.prepare("SELECT COUNT(*) count FROM users").get()
  console.log(`Inserted 10,000 rows in ${((t1 - t0) / 1000).toFixed(2)}s. Total rows in table: ${count.toLocaleString('en-CA')}.`)
}

main()
