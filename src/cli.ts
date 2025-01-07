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
            'Update an Employee Role',
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
        if (answers.choice === 'Add a Role') {
          addARole();
        }
        if (answers.choice === 'Add an Employee'){
          addAnEmployee();
        }
        if (answers.choice === 'Update an Employee Role'){
          updateEmployeeRole();
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
      pool.query(`SELECT role.id, title, salary, department.name AS department
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
    function addARole(): void {
      //Get the department list
      pool.query(`SELECT DISTINCT name FROM DEPARTMENT`, (err: Error, result: QueryResult) => {
        if (err) {
          console.log(err);
        } else if (result) {
          const departmentNames = result.rows.map(row => row.name);
          //console.log (departmentNames);
        
        inquirer
        .prompt ([
          {
          type: 'input',
          name: 'roleName',
          message: 'What is the name of the role?'
        },
        {
          type: 'input',
          name: 'roleSalary',
          message: 'What is the salary of the role?'
        },
        {
          type: 'list',
          name: 'roleDepartment',
          message: 'Which department does the role belong to?',
          choices: departmentNames
        }
      ])
      .then ((answers) => {
        const { roleName, roleSalary, roleDepartment } = answers;
        pool.query(
          // This is a parameterized query that utilizes a subquery to find the department ID based on the department name.
          `INSERT INTO role (title, salary, department_id)
          VALUES ($1, $2, (SELECT id FROM department WHERE name = $3))`,
          [roleName, roleSalary, roleDepartment],
          (err: Error, _result: QueryResult) => {
            if (err) {
              console.log(err);
            }
            else {
              console.log (`Added ${roleName} to the Database.`)
            }
            mainMenu();
          }
        );
        });
      }
    else {
      console.log('No departments found');
      mainMenu();
    }
    })};

    function addAnEmployee(): void {
      //Get the role list
      pool.query(`SELECT DISTINCT title FROM ROLE`, (err: Error, result: QueryResult) => {
        if (err) {
          console.log(err);
        } else if (result) {
          const roleNames = result.rows.map(row => row.title);
  
      pool.query (`SELECT id, CONCAT (first_name, ' ', last_name) AS "Manager Name" FROM employee`, (err: Error, result: QueryResult) => {
        if (err) {
          console.log(err);
        } else if (result) {
          const managers = result.rows.map(row => ({ name: row["Manager Name"], value: row.id}));
          managers.unshift({ name: 'None', value: null })
        inquirer
        .prompt ([
          {
          type: 'input',
          name: 'employeeFirstName',
          message: 'What is the first name of the employee?'
        },
        {
          type: 'input',
          name: 'employeeLastName',
          message: 'What is the last name of the employee?'
        },
        {
          type: 'list',
          name: 'roleName',
          message: 'Which department does the role belong to?',
          choices: roleNames
        },
        {
          type: 'list',
          name: 'managerId',
          message: 'Who is the manager of the employee?',
          choices: managers
        }
      ])
      .then ((answers) => {
        const { employeeFirstName, employeeLastName, roleName, managerId } = answers;
        pool.query(
          `INSERT INTO employee (first_name, last_name, role_id, manager_id)
          VALUES ($1, $2, (SELECT id FROM role WHERE title = $3), $4)`,
          [employeeFirstName, employeeLastName, roleName, managerId],
          (err: Error, _result: QueryResult) => {
            if (err) {
              console.log(err);
            }
            else {
              console.log (`Added ${employeeFirstName} ${employeeLastName} to the Database.`)
            }
            mainMenu();
          }
        );
      });
  }
});
}
});
}
function updateEmployeeRole(): void {
  // Get the employee list
  pool.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS "Employee Name" FROM employee`, (err: Error, result: QueryResult) => {
    if (err) {
      console.log(err);
    } else if (result) {
      const employees = result.rows.map(row => ({ name: row["Employee Name"], value: row.id }));

      // Get the role list
      pool.query(`SELECT DISTINCT title FROM role`, (err: Error, result: QueryResult) => {
        if (err) {
          console.log(err);
        } else if (result) {
          const roleNames = result.rows.map(row => row.title);

          inquirer
            .prompt([
              {
                type: 'list',
                name: 'employeeId',
                message: 'Which employee\'s role do you want to update?',
                choices: employees
              },
              {
                type: 'list',
                name: 'roleName',
                message: 'Which role do you want to assign to the selected employee?',
                choices: roleNames
              }
            ])
            .then((answers) => {
              const { employeeId, roleName } = answers;
              pool.query(
                `UPDATE employee SET role_id = (SELECT id FROM role WHERE title = $1) WHERE id = $2`,
                [roleName, employeeId],
                (err: Error, _result: QueryResult) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(`Updated role for employee.`);
                  }
                  mainMenu();
                }
              );
            });
        }
      });
    }
  });
}

//function calls to start the program
  await connectToDb();
  mainMenu();
