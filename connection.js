const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTable = require('console.table');

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'iLovepasswords10',
  database: 'employee_tracker'
});

// Prompt the user to select an option
function promptUser() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'option',
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Exit'
        ]
      }
    ])
    .then((answers) => {
      switch (answers.option) {
        case 'View all departments':
          viewAllDepartments();
          break;
        case 'View all roles':
          viewAllRoles();
          break;
        case 'View all employees':
          viewAllEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
        case 'Exit':
          console.log('Goodbye!');
          process.exit(0);
      }
    });
}

// View all departments
function viewAllDepartments() {
  pool.query('SELECT * FROM department', (err, results) => {
    if (err) {
      console.error('Error retrieving departments:', err);
    } else {
      console.table(results);
    }
    promptUser();
  });
}

// View all roles
function viewAllRoles() {
  const query = `
    SELECT role.id, role.title, role.salary, department.name AS department
    FROM role
    INNER JOIN department ON role.department_id = department.id
  `;
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving roles:', err);
    } else {
      console.table(results);
    }
    promptUser();
  });
}

// View all employees
function viewAllEmployees() {
  const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    INNER JOIN role ON employee.role_id = role.id
    INNER JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id
  `;
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving employees:', err);
    } else {
      console.table(results);
    }
    promptUser();
  });
}

// Add a department
function addDepartment() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter the name of the department:'
      }
    ])
    .then((answers) => {
      pool.query('INSERT INTO department (name) VALUES (?)', [answers.name], (err, results) => {
        if (err) {
          console.error('Error adding department:', err);
        } else {
          console.log('Department added successfully!');
        }
        promptUser();
      });
    });
}

// Add a role
function addRole() {
  // Retrieve department names and ids to display in the prompt
  pool.query('SELECT id, name FROM department', (err, departments) => {
    if (err) {
      console.error('Error retrieving departments:', err);
      promptUser();
      return;
    }

    inquirer
      .prompt([
        {
          type: 'input',
          name: 'title',
          message: 'Enter the title of the role:'
        },
        {
          type: 'input',
          name: 'salary',
          message: 'Enter the salary for the role:'
        },
        {
          type: 'list',
          name: 'departmentId',
          message: 'Select the department for the role:',
          choices: departments.map((department) => ({
            name: department.name,
            value: department.id
          }))
        }
      ])
      .then((answers) => {
        pool.query(
          'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)',
          [answers.title, answers.salary, answers.departmentId],
          (err, results) => {
            if (err) {
              console.error('Error adding role:', err);
            } else {
              console.log('Role added successfully!');
            }
            promptUser();
          }
        );
      });
  });
}

// Add an employee
function addEmployee() {
  // Retrieve role titles and ids to display in the prompt
  pool.query('SELECT id, title FROM role', (err, roles) => {
    if (err) {
      console.error('Error retrieving roles:', err);
      promptUser();
      return;
    }

    // Retrieve employee names and ids to display as manager options
    pool.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee', (err, employees) => {
      if (err) {
        console.error('Error retrieving employees:', err);
        promptUser();
        return;
      }

      inquirer
        .prompt([
          {
            type: 'input',
            name: 'firstName',
            message: "Enter the employee's first name:"
          },
          {
            type: 'input',
            name: 'lastName',
            message: "Enter the employee's last name:"
          },
          {
            type: 'list',
            name: 'roleId',
            message: "Select the employee's role:",
            choices: roles.map((role) => ({
              name: role.title,
              value: role.id
            }))
          },
          {
            type: 'list',
            name: 'managerId',
            message: "Select the employee's manager:",
            choices: [
              { name: 'None', value: null },
              ...employees.map((employee) => ({
                name: employee.name,
                value: employee.id
              }))
            ]
          }
        ])
        .then((answers) => {
          pool.query(
            'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
            [answers.firstName, answers.lastName, answers.roleId, answers.managerId],
            (err, results) => {
              if (err) {
                console.error('Error adding employee:', err);
              } else {
                console.log('Employee added successfully!');
              }
              promptUser();
            }
          );
        });
    });
  });
}

// Update an employee role
function updateEmployeeRole() {
  // Retrieve employee names and ids to display in the prompt
  pool.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee', (err, employees) => {
    if (err) {
      console.error('Error retrieving employees:', err);
      promptUser();
      return;
    }

    // Retrieve role titles and ids to display in the prompt
    pool.query('SELECT id, title FROM role', (err, roles) => {
      if (err) {
        console.error('Error retrieving roles:', err);
        promptUser();
        return;
      }

      inquirer
        .prompt([
          {
            type: 'list',
            name: 'employeeId',
            message: 'Select the employee to update:',
            choices: employees.map((employee) => ({
              name: employee.name,
              value: employee.id
            }))
          },
          {
            type: 'list',
            name: 'roleId',
            message: 'Select the new role for the employee:',
            choices: roles.map((role) => ({
              name: role.title,
              value: role.id
            }))
          }
        ])
        .then((answers) => {
          pool.query(
            'UPDATE employee SET role_id = ? WHERE id = ?',
            [answers.roleId, answers.employeeId],
            (err, results) => {
              if (err) {
                console.error('Error updating employee role:', err);
              } else {
                console.log('Employee role updated successfully!');
              }
              promptUser();
            }
          );
        });
    });
  });
}

// Start the application
promptUser();
