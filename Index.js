const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
    user: 'pavan',
    password: '1234',
    server: 'localhost', 
    database: 'Task',
    options: {
        trustedConnection : false,
        enableArithAbort: true,
        instancename:"MSSQLSERVER",
        trustServerCertificate: true
    },
    port : 1433
};


app.get('/tasks', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Tasks');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/tasks', async (req, res) => {
    const { assignedTo, status, dueDate, priority, comments } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('assignedTo', sql.NVarChar, assignedTo)
            .input('status', sql.NVarChar, status)
            .input('dueDate', sql.Date, dueDate)
            .input('priority', sql.NVarChar, priority)
            .input('comments', sql.NVarChar, comments)
            .query('INSERT INTO Tasks (assignedTo, status, dueDate, priority, comments) VALUES (@assignedTo, @status, @dueDate, @priority, @comments)');
        res.status(201).send('Task created successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { assignedTo, status, dueDate, priority, comments } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .input('assignedTo', sql.NVarChar, assignedTo)
            .input('status', sql.NVarChar, status)
            .input('dueDate', sql.Date, dueDate)
            .input('priority', sql.NVarChar, priority)
            .input('comments', sql.NVarChar, comments)
            .query('UPDATE Tasks SET assignedTo = @assignedTo, status = @status, dueDate = @dueDate, priority = @priority, comments = @comments WHERE id = @id');
        res.send('Task updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Tasks WHERE id = @id');
        res.send('Task deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
