import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import env from '@/src/env'
import * as schema from './schema'

const client = postgres(env.DATABASE_URL, { prepare: false })
export const db = drizzle(client, { schema });