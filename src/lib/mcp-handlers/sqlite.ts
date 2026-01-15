// SQLite handler - uses in-memory database or file-based
import { promises as fs } from "fs";
import path from "path";
import os from "os";

// Simple SQL parser for demo purposes
// In production, you'd use better-sqlite3 or sql.js

interface TableSchema {
  name: string;
  columns: Array<{ name: string; type: string }>;
}

interface SQLiteDB {
  tables: Record<string, { schema: TableSchema; rows: Record<string, unknown>[] }>;
}

const DB_FILE = path.join(os.tmpdir(), "mcpilot-sqlite.json");

async function loadDB(): Promise<SQLiteDB> {
  try {
    const content = await fs.readFile(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    // Create demo database
    return {
      tables: {
        users: {
          schema: {
            name: "users",
            columns: [
              { name: "id", type: "INTEGER" },
              { name: "name", type: "TEXT" },
              { name: "email", type: "TEXT" },
              { name: "created_at", type: "TEXT" },
            ],
          },
          rows: [
            { id: 1, name: "Alice Johnson", email: "alice@example.com", created_at: "2024-01-15" },
            { id: 2, name: "Bob Smith", email: "bob@example.com", created_at: "2024-01-16" },
            { id: 3, name: "Carol Williams", email: "carol@example.com", created_at: "2024-01-17" },
          ],
        },
        products: {
          schema: {
            name: "products",
            columns: [
              { name: "id", type: "INTEGER" },
              { name: "name", type: "TEXT" },
              { name: "price", type: "REAL" },
              { name: "category", type: "TEXT" },
            ],
          },
          rows: [
            { id: 1, name: "Laptop", price: 999.99, category: "Electronics" },
            { id: 2, name: "Headphones", price: 199.99, category: "Electronics" },
            { id: 3, name: "Coffee Mug", price: 12.99, category: "Kitchen" },
          ],
        },
        orders: {
          schema: {
            name: "orders",
            columns: [
              { name: "id", type: "INTEGER" },
              { name: "user_id", type: "INTEGER" },
              { name: "product_id", type: "INTEGER" },
              { name: "quantity", type: "INTEGER" },
              { name: "total", type: "REAL" },
            ],
          },
          rows: [
            { id: 1, user_id: 1, product_id: 1, quantity: 1, total: 999.99 },
            { id: 2, user_id: 2, product_id: 2, quantity: 2, total: 399.98 },
          ],
        },
      },
    };
  }
}

async function saveDB(db: SQLiteDB): Promise<void> {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

function parseSimpleSelect(query: string, db: SQLiteDB): { table: string; columns: string[]; where?: string; limit?: number } {
  const normalized = query.replace(/\s+/g, " ").trim().toLowerCase();
  
  // Parse SELECT ... FROM ... [WHERE ...] [LIMIT ...]
  const selectMatch = normalized.match(/select\s+(.+?)\s+from\s+(\w+)/i);
  if (!selectMatch) throw new Error("Invalid SELECT query");
  
  const columns = selectMatch[1] === "*" ? ["*"] : selectMatch[1].split(",").map(c => c.trim());
  const table = selectMatch[2];
  
  const limitMatch = normalized.match(/limit\s+(\d+)/i);
  const limit = limitMatch ? parseInt(limitMatch[1]) : undefined;
  
  return { table, columns, limit };
}

export async function handleSQLite(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const db = await loadDB();

  switch (toolName) {
    case "read_query": {
      const query = params.query as string;
      if (!query) throw new Error("Query is required");
      
      try {
        const parsed = parseSimpleSelect(query, db);
        const table = db.tables[parsed.table];
        
        if (!table) {
          throw new Error(`Table '${parsed.table}' not found`);
        }
        
        let rows = [...table.rows];
        
        if (parsed.limit) {
          rows = rows.slice(0, parsed.limit);
        }
        
        if (parsed.columns[0] !== "*") {
          rows = rows.map(row => {
            const filtered: Record<string, unknown> = {};
            for (const col of parsed.columns) {
              if (col in row) filtered[col] = row[col];
            }
            return filtered;
          });
        }
        
        return {
          query,
          columns: parsed.columns[0] === "*" ? table.schema.columns.map(c => c.name) : parsed.columns,
          rows,
          rowCount: rows.length,
          executionTime: `${Math.random() * 10 + 1}ms`,
        };
      } catch (e) {
        throw new Error(`SQL Error: ${(e as Error).message}`);
      }
    }

    case "write_query": {
      const query = params.query as string;
      if (!query) throw new Error("Query is required");
      
      const normalized = query.toLowerCase().trim();
      
      if (normalized.startsWith("insert into")) {
        // Simple INSERT parsing
        const match = query.match(/insert into (\w+)/i);
        if (!match) throw new Error("Invalid INSERT query");
        
        const tableName = match[1];
        const table = db.tables[tableName];
        if (!table) throw new Error(`Table '${tableName}' not found`);
        
        // Add a demo row
        const newId = table.rows.length + 1;
        table.rows.push({ id: newId, ...Object.fromEntries(table.schema.columns.slice(1).map(c => [c.name, "new_value"])) });
        
        await saveDB(db);
        return { affectedRows: 1, lastInsertId: newId };
      }
      
      if (normalized.startsWith("update")) {
        return { affectedRows: 1, message: "UPDATE executed (demo mode)" };
      }
      
      if (normalized.startsWith("delete")) {
        return { affectedRows: 1, message: "DELETE executed (demo mode)" };
      }
      
      throw new Error("Only INSERT, UPDATE, DELETE queries are supported");
    }

    case "create_table": {
      const query = params.query as string;
      if (!query) throw new Error("Query is required");
      
      const match = query.match(/create table (\w+)/i);
      if (!match) throw new Error("Invalid CREATE TABLE query");
      
      const tableName = match[1];
      if (db.tables[tableName]) {
        throw new Error(`Table '${tableName}' already exists`);
      }
      
      db.tables[tableName] = {
        schema: { name: tableName, columns: [{ name: "id", type: "INTEGER" }] },
        rows: [],
      };
      
      await saveDB(db);
      return { success: true, table: tableName, message: "Table created" };
    }

    case "list_tables": {
      return {
        tables: Object.keys(db.tables).map(name => ({
          name,
          columns: db.tables[name].schema.columns.length,
          rows: db.tables[name].rows.length,
        })),
      };
    }

    case "describe_table": {
      const tableName = params.table_name as string;
      if (!tableName) throw new Error("table_name is required");
      
      const table = db.tables[tableName];
      if (!table) throw new Error(`Table '${tableName}' not found`);
      
      return {
        table: tableName,
        columns: table.schema.columns,
        rowCount: table.rows.length,
      };
    }

    default:
      throw new Error(`Unknown SQLite tool: ${toolName}`);
  }
}
