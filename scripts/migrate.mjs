import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
const sql=neon(process.env.DATABASE_URL);
const source=await readFile(new URL("../db/schema.sql",import.meta.url),"utf8");
for(const statement of source.split(";").map(x=>x.trim()).filter(Boolean)) await sql.query(statement);
console.log("Academy schema ready");
