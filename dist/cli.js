import inquirer from "inquirer";
import { pool, connectToDb } from './connection.js';
function mainMenu() {
    inquirer
        .prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Main Menu -- Please select from the following options',
            choices: [
                'View all Departments',
                'View all roles',
                'View all Employees',
                'Add a Department',
                'Add a Role',
                'Add an Employee',
                'Exit',
            ],
        },
    ])
        .then((answers) => {
        //evaluate feedback
        if (answers.choice === 'View all Departments') {
            viewAllDepartments();
        }
        if (answers.choice === 'View all roles') {
            viewAllRoles();
        }
        if (answers.choice === 'View all employees') {
            viewAllEmployees();
        }
        if (answers.choice === 'Exit') {
            pool.end();
            process.exit();
        }
    });
}
function viewAllDepartments() {
    pool.query('SELECT * FROM DEPARTMENT', (err, result) => {
        if (err) {
            console.log(err);
        }
        else if (result) {
            console.table(result.rows);
            // const formattedRows = result.rows.map(({ id, title, salary, name }) => ({
            //   ID: id,
            //   Title: title,
            //   Salary: salary,
            //   Department: name
            // }));
            // console.table(formattedRows);
        }
        mainMenu();
    });
}
function viewAllRoles() {
    pool.query(`SELECT role.id, title, salary, department.name 
        FROM role 
        JOIN department on role.department_id = department.id;`, (err, result) => {
        if (err) {
            console.log(err);
        }
        else if (result) {
            console.table(result.rows);
        }
        mainMenu();
    });
}
// async function viewAllEmployees(): Promise<void> {
//   //note the backticks. This is necessary because of the way the concat function works.
//   try {
//     const result = await pool.query(
//     `SELECT employee.id, 
//             employee.first_name AS "Employee First Name",
//             employee.last_name AS "Employee Last Name", 
//             role.title, 
//             department.name AS Department, 
//             role.salary, 
//             CONCAT (manager.first_name, ' ', manager.last_name) AS "Manager Name" 
//     FROM employee 
//     INNER JOIN role ON employee.role_id = role.id 
//     INNER JOIN department ON role.department_id = department.id
//     LEFT JOIN employee AS manager ON employee.manager_id = manager.id;`);
//     console.table(result.rows);
//     }catch (err) {
//       console.error('Error executing query:', err)
//     } 
//     finally {
//       mainMenu();
//     }
//     // (err: Error, result: QueryResult) => {
//     // if (err) {
//     //   console.log(err);
//     // } else if (result) {
//     //   console.table(result.rows);
//     // }
//     // mainMenu();
//   };
function viewAllEmployees() {
    pool.query(`SELECT employee.id, employee.first_name AS "Employee First Name", employee.last_name AS "Employee Last Name", role.title, department.name AS Department, role.salary, CONCAT (manager.first_name, ' ', manager.last_name) AS "Manager Name" 
FROM employee
INNER JOIN role ON employee.role_id = role.id
INNER JOIN department ON role.department_id = department.id 
LEFT JOIN employee AS manager ON employee.manager_id = manager.id;`, (err, result) => {
        if (err) {
            console.log(`Error executing query:`, err);
        }
        else if (result) {
            console.log(`Query executed successfully`);
            console.table(result.rows);
        }
        else {
            console.log('No Result Returned.');
        }
        mainMenu();
    });
}
//function calls
mainMenu();
await connectToDb();
