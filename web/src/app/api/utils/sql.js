import { neon } from "@neondatabase/serverless";
import { loadServerEnv } from "@/utils/loadServerEnv.js";
import { isNeonDatabaseConfigured } from "./dbConfig.js";

loadServerEnv();

const NullishQueryFunction = () => {
  throw new Error(
    "Neon is not configured. Set a valid DATABASE_URL or use Supabase-backed APIs.",
  );
};
NullishQueryFunction.transaction = () => {
  throw new Error(
    "Neon is not configured. Set a valid DATABASE_URL or use Supabase-backed APIs.",
  );
};

let neonSql = null;

function getSqlClient() {
  if (neonSql !== null) return neonSql;
  neonSql = isNeonDatabaseConfigured()
    ? neon(process.env.DATABASE_URL)
    : NullishQueryFunction;
  return neonSql;
}

/** Tagged-template SQL client (Neon). No-ops when DATABASE_URL is missing or a placeholder. */
function sql(strings, ...values) {
  return getSqlClient()(strings, ...values);
}
sql.transaction = (...args) => getSqlClient().transaction(...args);

export default sql;
