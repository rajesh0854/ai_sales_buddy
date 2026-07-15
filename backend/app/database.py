"""SQLite connection helpers with dict row access."""
import sqlite3
import json
from contextlib import contextmanager
from .config import settings


def get_connection():
    conn = sqlite3.connect(settings.DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def db_cursor():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def _row_to_dict(row):
    """Convert a Row to dict, auto-parsing JSON-looking text fields."""
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, str) and v[:1] in ("[", "{"):
            try:
                d[k] = json.loads(v)
            except (ValueError, TypeError):
                pass
    return d


def query_all(sql, params=()):
    with db_cursor() as conn:
        rows = conn.execute(sql, params).fetchall()
        return [_row_to_dict(r) for r in rows]


def query_one(sql, params=()):
    with db_cursor() as conn:
        row = conn.execute(sql, params).fetchone()
        return _row_to_dict(row) if row else None


def execute(sql, params=()):
    with db_cursor() as conn:
        cur = conn.execute(sql, params)
        return cur.lastrowid


def next_id(prefix, table, id_col, width=5):
    """Generate the next sequential id like PREFIX00001."""
    with db_cursor() as conn:
        row = conn.execute(f"SELECT {id_col} FROM {table} ORDER BY {id_col} DESC LIMIT 1").fetchone()
    if not row:
        return f"{prefix}{1:0{width}d}"
    last = row[0]
    num = int("".join(ch for ch in last if ch.isdigit()) or 0) + 1
    return f"{prefix}{num:0{width}d}"
