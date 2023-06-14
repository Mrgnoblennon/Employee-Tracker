const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'iLovepasswords10',
  database: 'employee_tracker',
  waitForConnections: true,
  connectionLimit: 10,
});

async function seedData() {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Start a transaction
    await connection.beginTransaction();

    try {
      // Seed the department table
      await connection.query('INSERT INTO department (id, name) VALUES (1, "Engineering"), (2, "Sales"), (3, "Marketing")');

      // Seed the role table
      await connection.query('INSERT INTO role (id, title, salary, department_id) VALUES (1, "Engineer", 50000, 1), (2, "Salesperson", 60000, 2), (3, "Marketing Coordinator", 40000, 3)');

      // Seed the employee table
      await connection.query('INSERT INTO employee (id, first_name, last_name, role_id, manager_id) VALUES (1, "John", "Doe", 1, NULL), (2, "Jane", "Smith", 2, 1), (3, "Mike", "Johnson", 3, 1)');

      // Commit the transaction
      await connection.commit();

      console.log('Data seeded successfully!');
    } catch (error) {
      // Something went wrong, rollback the transaction
      await connection.rollback();
      throw error;
    } finally {
      // Release the connection
      connection.release();
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    // End the database connection
    pool.end();
  }
}

// Call the function to seed the data
seedData();
