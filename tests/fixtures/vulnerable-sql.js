// SQL Injection vulnerability sample
function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return database.query(query);
}

function searchUsers(searchTerm) {
  const sql = `SELECT name, email FROM users WHERE name LIKE '%${searchTerm}%'`;
  return db.execute(sql);
}

// More vulnerable patterns
const dynamicQuery = "UPDATE users SET status = '" + userStatus + "' WHERE id = " + id;