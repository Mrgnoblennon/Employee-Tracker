USE employee_tracker;

-- insert data into department table --
INSERT INTO department (name) VALUES
  ('Department A'),
  ('Department B'),
  ('Department C');

-- insert data into role table --
INSERT INTO role (title, salary, department_id) VALUES
  ('Master', 50000.00, 1),
  ('Citizen', 60000.00, 2),
  ('Person', 70000.00, 3);

-- insert data into employee table --
INSERT INTO employee (first_name, last_name, role_id, manager_id, department_id) VALUES
  ('Chase', 'BB', 1, NULL, 1),
  ('Jack', 'MP', 2, 1, 1),
  ('Harrison', 'MP', 2, 1, 2),
  ('Marcus', 'H', 3, 2, 2),
  ('Ben', 'L', 3, 1, 3);
