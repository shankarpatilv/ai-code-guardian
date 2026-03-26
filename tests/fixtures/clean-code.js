// Clean, secure code sample
import bcrypt from 'bcrypt';
import { validateInput } from './validators.js';

/**
 * User service with secure practices
 */
class UserService {
  constructor(database) {
    this.db = database;
  }

  /**
   * Get user by ID using parameterized query
   */
  async getUserById(userId) {
    if (!validateInput(userId, 'number')) {
      throw new Error('Invalid user ID');
    }

    const query = 'SELECT id, name, email FROM users WHERE id = ?';
    return await this.db.query(query, [userId]);
  }

  /**
   * Search users with proper sanitization
   */
  async searchUsers(searchTerm) {
    const sanitizedTerm = validateInput(searchTerm, 'string');
    const query = 'SELECT id, name FROM users WHERE name LIKE ? LIMIT 10';
    return await this.db.query(query, [`%${sanitizedTerm}%`]);
  }

  /**
   * Hash password securely
   */
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }
}

export default UserService;