const express = require('express');
const pool = require('../db');
const router = express.Router();

// Create a new customer
// {
//     "name": "John Doe",
//     "email": "john@example.com",
//     "phone": "1234567890",
//     "address": "123 Main St",
//     "company_id": 1
// }

router.post('/', async (req, res) => {
    const { name, email, phone, address, company_id } = req.body;

    // Check if company_id is provided
    if (!company_id) {
        return res.status(400).json({ error: 'company_id is required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO customers (name, email, phone, address, company_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, email, phone, address, company_id]
        );
        console.log(result.rows[0]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


// Get all customers with pagination
//GET http://localhost:3000/api/customers?page=1&company_id=123
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const companyId = req.query.company_id; // Extract company_id from query parameters
        const limit = 10;
        const offset = (page - 1) * limit;

        if (!companyId) {
            return res.status(400).json({ error: 'company_id is required' });
        }

        // Fetch total number of records for the specified company
        const totalResult = await pool.query('SELECT COUNT(*) FROM customers WHERE company_id = $1', [companyId]);
        const totalRecords = parseInt(totalResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalRecords / limit);

        // Fetch paginated results for the specified company
        const result = await pool.query(
            'SELECT * FROM customers WHERE company_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3',
            [companyId, limit, offset]
        );

        res.json({
            data: result.rows,
            currentPage: page,
            totalPages: totalPages,
            totalRecords: totalRecords,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get a customer by ID
// GET http://localhost:3000/api/customers/1?company_id=123
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { company_id } = req.query; // Extract company_id from query parameters

    if (!company_id) {
        return res.status(400).json({ error: 'company_id is required' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM customers WHERE id = $1 AND company_id = $2',
            [id, company_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Update a customer

// PUT http://localhost:3000/api/customers/1
// Content-Type: application/json

// {
//   "name": "Jane Doe",
//   "email": "jane@example.com",
//   "phone": "1234567890",
//   "address": "123 Main St",
//   "company_id": 123
// }
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address, company_id } = req.body;

    if (!company_id) {
        return res.status(400).json({ error: 'company_id is required' });
    }

    try {
        const result = await pool.query(
            'UPDATE customers SET name = $1, email = $2, phone = $3, address = $4 WHERE id = $5 AND company_id = $6 RETURNING *',
            [name, email, phone, address, id, company_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found or does not belong to the specified company' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Delete a customer
// DELETE http://localhost:3000/api/customers/1?company_id=123
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { company_id } = req.query; // Extract company_id from query parameters

    if (!company_id) {
        return res.status(400).json({ error: 'company_id is required' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM customers WHERE id = $1 AND company_id = $2 RETURNING *',
            [id, company_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found or does not belong to the specified company' });
        }
        res.json({ message: 'Customer deleted', customer: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
