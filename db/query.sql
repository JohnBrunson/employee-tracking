SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM manager;
SELECT * FROM employee;

-- experimental algorithms for the front end.

-- view departments
-- SELECT * FROM DEPARTMENT

-- View all Roles
SELECT role.id, title, salary, department.name FROM role 
JOIN department on role.department_id = department.id;

--View all Employees

SELECT employee.id, employee.first_name AS "Employee First Name", employee.last_name AS "Employee Last Name", role.title, department.name AS Department, role.salary, CONCAT (manager.first_name, ' ', manager.last_name) AS "Manager Name" 
FROM employee
INNER JOIN role ON employee.role_id = role.id
INNER JOIN department ON role.department_id = department.id 
LEFT JOIN employee AS manager ON employee.manager_id = manager.id;

-- add department 
--INSERT INTO department (name) VALUES ('Sales'),

-- add role
-- Insert into role ( Title, Salary, department_id as department)
-- List of departments

-- add employee
-- Insert into employees (first_name, last_name, role_id, Manager)
--List of roles
-- List of managers

-- update role
-- UPDATE employee set role_id = <selected role_id> where employee_id = <selected employee ID/name>