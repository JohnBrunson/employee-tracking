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
        if (answers.choice === 'Exit') {
            pool.end();
            process.exit();
        }
    });
}
function viewAllDepartments() {
    pool.query('SELECT role.id, title, salary, department.name FROM role JOIN department on role.department_id = department.id;', (err, result) => {
        if (err) {
            console.log(err);
        }
        else if (result) {
            //console.table(result.rows);
            const formattedRows = result.rows.map(({ id, title, salary, name }) => ({
                ID: id,
                Title: title,
                Salary: salary,
                Department: name
            }));
            console.table(formattedRows);
        }
        mainMenu();
    });
}
//function calls
await connectToDb();
mainMenu();
