# Python test samples

# SQL injection vulnerability
def get_user(user_id):
    query = "SELECT * FROM users WHERE id = " + str(user_id)
    return execute_query(query)

# Command injection
import subprocess
def run_command(user_input):
    subprocess.call("ls " + user_input, shell=True)

# Hardcoded secrets
API_KEY = "sk_test_1234567890abcdef"
DATABASE_URL = "postgres://user:password123@localhost/db"

# Clean code example
import sqlite3
from typing import Optional, List

def get_user_safe(user_id: int, conn: sqlite3.Connection) -> Optional[dict]:
    """Safely retrieve user by ID using parameterized query."""
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    
    if row:
        return {
            "id": row[0],
            "name": row[1], 
            "email": row[2]
        }
    return None

def search_users(search_term: str, conn: sqlite3.Connection) -> List[dict]:
    """Search users with proper parameterization."""
    if not isinstance(search_term, str) or len(search_term) > 100:
        raise ValueError("Invalid search term")
    
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM users WHERE name LIKE ? LIMIT 10", (f"%{search_term}%",))
    
    return [{"id": row[0], "name": row[1]} for row in cursor.fetchall()]