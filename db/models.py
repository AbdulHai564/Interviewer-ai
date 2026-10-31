import json

import psycopg2
from psycopg2.extras import RealDictCursor

from config import DATABASE_URL


def get_conn():
    return psycopg2.connect(DATABASE_URL, connect_timeout=15)


CREATE_TABLES = """
CREATE TABLE IF NOT EXISTS companies (
    id          SERIAL PRIMARY KEY,
    name        TEXT UNIQUE NOT NULL,
    industry    TEXT,
    intel_json  JSONB,
    fetched_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company             TEXT NOT NULL,
    role                TEXT NOT NULL,
    current_round       TEXT DEFAULT 'recruiter',
    status              TEXT DEFAULT 'active',
    recruiter_results   JSONB DEFAULT '{}',
    technical_results   JSONB DEFAULT '{}',
    coding_results      JSONB DEFAULT '{}',
    round_results       JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
"""

ALTER_TABLES = """
ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS round_results JSONB DEFAULT '{}';
"""


def init_db():
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(CREATE_TABLES)
            cur.execute(ALTER_TABLES)
        conn.commit()
    print("✅ Tables ready")


def upsert_company(name: str, industry: str, intel: dict):
    sql = """
        INSERT INTO companies (name, industry, intel_json, fetched_at)
        VALUES (%s, %s, %s, NOW())
        ON CONFLICT (name) DO UPDATE
            SET intel_json = EXCLUDED.intel_json,
                fetched_at = NOW()
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (name, industry, json.dumps(intel)))
        conn.commit()


def get_company_intel(name: str) -> dict | None:
    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM companies WHERE name = %s", (name,))
            row = cur.fetchone()
            return dict(row) if row else None


def create_session(company: str, role: str) -> str:
    sql = """
        INSERT INTO sessions (company, role)
        VALUES (%s, %s)
        RETURNING id
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (company, role))
            session_id = str(cur.fetchone()[0])
        conn.commit()
    return session_id


def update_session(session_id: str, **kwargs):
    if not kwargs:
        return
    jsonb_cols = {
        "recruiter_results",
        "technical_results",
        "coding_results",
        "round_results",
    }
    set_clauses = []
    values = []
    for key, value in kwargs.items():
        set_clauses.append(f"{key} = %s")
        values.append(json.dumps(value) if key in jsonb_cols else value)
    set_clauses.append("updated_at = NOW()")
    values.append(session_id)
    sql = f"UPDATE sessions SET {', '.join(set_clauses)} WHERE id = %s"
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, values)
        conn.commit()


def get_session(session_id: str) -> dict | None:
    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM sessions WHERE id = %s", (session_id,))
            row = cur.fetchone()
            return dict(row) if row else None