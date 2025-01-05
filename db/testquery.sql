SELECT employee.id, employee.first_name AS "Employee First Name", employee.last_name AS "Employee Last Name", role.title, department.name AS Department, role.salary, CONCAT (manager.first_name, ' ', manager.last_name) AS "Manager Name" 
FROM employee
INNER JOIN role ON employee.role_id = role.id
INNER JOIN department ON role.department_id = department.id 
LEFT JOIN employee AS manager ON employee.manager_id = manager.id;