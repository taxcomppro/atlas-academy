// lib/db.ts — provides a tagged-template SQL function that wraps Prisma.$queryRawUnsafe
// This maintains backward compat with all existing `const sql = db(); await sql\`...\`` patterns
// while routing queries through the shared Prisma connection pool.
import { prisma } from "./prisma";

type SqlTag = (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;

function buildQuery(strings: TemplateStringsArray, values: any[]) {
  let query = "";
  let paramIndex = 1;
  const params: any[] = [];
  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if (i < values.length) {
      query += `$${paramIndex++}`;
      params.push(values[i]);
    }
  }
  return { query, params };
}

export function db(): SqlTag {
  return function sqlTag(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
    const { query, params } = buildQuery(strings, values);
    return prisma.$queryRawUnsafe(query, ...params) as Promise<any[]>;
  };
}
