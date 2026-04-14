import initSqlJs, { Database as SqlJsDatabase, SqlValue } from 'sql.js';
import path from 'path';
import os from 'os';
import fs from 'fs';

const DB_DIR = path.join(os.homedir(), '.shellpaycli');
export const DB_PATH = process.env.SHELLPAY_DB_PATH || path.join(DB_DIR, 'shellpay.db');

let _initPromise: Promise<DbWrapper> | null = null;

class PreparedStatement {
  constructor(
    private sqlDb: SqlJsDatabase,
    private sql: string,
    private persist: () => void
  ) {}

  get<T>(...params: unknown[]): T | undefined {
    const stmt = this.sqlDb.prepare(this.sql);
    if (params.length > 0) stmt.bind(params as SqlValue[]);
    const result = stmt.step() ? (stmt.getAsObject() as unknown as T) : undefined;
    stmt.free();
    return result;
  }

  all<T>(...params: unknown[]): T[] {
    const stmt = this.sqlDb.prepare(this.sql);
    if (params.length > 0) stmt.bind(params as SqlValue[]);
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as T);
    }
    stmt.free();
    return results;
  }

  run(...params: unknown[]): void {
    this.sqlDb.run(this.sql, params as SqlValue[]);
    this.persist();
  }
}

export class DbWrapper {
  constructor(private sqlDb: SqlJsDatabase, private dbPath: string) {}

  prepare(sql: string): PreparedStatement {
    return new PreparedStatement(this.sqlDb, sql, () => this.persist());
  }

  exec(sql: string): void {
    this.sqlDb.run(sql);
    this.persist();
  }

  persist(): void {
    const data = this.sqlDb.export();
    fs.writeFileSync(this.dbPath, Buffer.from(data));
  }

  close(): void {
    this.persist();
    this.sqlDb.close();
  }
}

async function initDb(): Promise<DbWrapper> {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();
  const fileBuffer = fs.existsSync(DB_PATH)
    ? new Uint8Array(fs.readFileSync(DB_PATH))
    : undefined;

  const sqlDb = new SQL.Database(fileBuffer);
  const wrapper = new DbWrapper(sqlDb, DB_PATH);

  sqlDb.run(`CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    public_key TEXT NOT NULL,
    private_key TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  sqlDb.run(`CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    wallet_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  sqlDb.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_name TEXT NOT NULL,
    signature TEXT NOT NULL,
    amount REAL NOT NULL,
    recipient TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  wrapper.persist();
  return wrapper;
}

export async function getDatabase(): Promise<DbWrapper> {
  if (!_initPromise) {
    _initPromise = initDb();
  }
  return _initPromise;
}

export async function closeDatabase(): Promise<void> {
  if (_initPromise) {
    const db = await _initPromise;
    db.close();
    _initPromise = null;
  }
}
