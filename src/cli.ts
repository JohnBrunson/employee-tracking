import inquirer from "inquirer";
import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';

function mainMenu(): void {
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
        if (answers.choice === 'View all Departments'){
          viewAllDepartments();
        }
        if (answers.choice === 'View all roles') {
          viewAllRoles();
        }
        if (answers.choice === 'View all Employees') {
          viewAllEmployees();
        }
        if (answers.choice === 'Add a Department') {
          addADepartment()
        }
        if (answers.choice === 'Exit'){
          pool.end();
          process.exit();
        }
        
      });
    }

    function viewAllDepartments(): void {
      pool.query('SELECT * FROM DEPARTMENT', 
        (err:Error, result: QueryResult) => {
          if (err){
            console.log(err);
          }else if (result){
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
        } )
    }
    function viewAllRoles(): void {
      pool.query(`SELECT role.id, title, salary, department.name 
        FROM role 
        JOIN department on role.department_id = department.id;`, (err: Error, result: QueryResult) => {
        if (err) {
          console.log(err);
        } else if (result) {
          console.table(result.rows);
        }
        mainMenu();
      });

    }

    function viewAllEmployees(): void {
      pool.query(`SELECT employee.id, employee.first_name AS "Employee First Name", employee.last_name AS "Employee Last Name", role.title, department.name AS Department, role.salary, CONCAT (manager.first_name, ' ', manager.last_name) AS "Manager Name" 
FROM employee
INNER JOIN role ON employee.role_id = role.id
INNER JOIN department ON role.department_id = department.id 
LEFT JOIN employee AS manager ON employee.manager_id = manager.id;`,
      (err: Error, result: QueryResult) => {
        if (err) {
          console.log(`Error executing query:`, err)
        } else if (result){
          console.log(`Query executed successfully`)
          console.table(result.rows);
        } else {
          console.log ('No Result Returned.')
        }
        mainMenu();
      });
    }
    function addADepartment(): void {
      inquirer
        .prompt([{
          type: 'input',
          name: 'userDepartment',
          message: 'What is the name of the department?',

        }
      ])
      .then ((answers) => {
        const userDepartment = answers.userDepartment;
        pool.query(`INSERT INTO department (name) VALUES ($1)`,[userDepartment], (err: Error, result: QueryResult) => {
          if (err) {
            console.log(err);
          } else if (result) {
            console.log (`Added ${userDepartment} to the database.`);
          }
          mainMenu();
        });
      })
    }

//function calls to start the program
  await connectToDb();
  mainMenu();

