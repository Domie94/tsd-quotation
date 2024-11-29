const express = require('express');
const pool = require('../db');
const router = express.Router();

// Create a new quotation
// POST http://localhost:3000/api/quotations
// Content-Type: application/json

// {
//     "customer_id": 1,
//     "quote_date": "2024-11-25",
//     "status": "pending",
//     "company_id": 1
// }

router.post('/', async (req, res) => {
    const { customer_id, quote_date, status, company_id } = req.body;

    // Validate that company_id is provided
    if (!company_id) {
        return res.status(400).json({ error: 'company_id is required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO quotations (quote_number, customer_id, quote_date, status, company_id) VALUES (generate_quote_number(), $1, $2, $3, $4) RETURNING *',
            [customer_id, quote_date, status, company_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all quotations with pagination
// GET http://localhost:3000/api/quotations?page=1&company_id=1
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const companyId = req.query.company_id; // Get company_id from query

        if (!companyId) {
            return res.status(400).json({ error: 'company_id is required' });
        }

        // Fetch total number of records for the specified company
        const totalResult = await pool.query('SELECT COUNT(*) FROM quotations WHERE company_id = $1', [companyId]);
        const totalRecords = parseInt(totalResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalRecords / limit);

        // Fetch paginated results with JOIN
        const result = await pool.query(
            `
            SELECT q.id AS quotation_id, q.quote_number, q.quote_date, q.status, 
                   c.name AS customer_name 
            FROM quotations q
            JOIN customers c ON q.customer_id = c.id
            WHERE q.company_id = $1
            ORDER BY q.id DESC
            LIMIT $2 OFFSET $3
            `,
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

// Get a single quotation by ID
// GET http://localhost:3000/api/quotations/1?company_id=1
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { company_id } = req.query; // Extract company_id from query parameters

    if (!company_id) {
        return res.status(400).json({ error: 'company_id is required' });
    }

    try {
        const result = await pool.query(
            `
            SELECT q.id AS quotation_id, q.quote_number, q.quote_date, q.status, 
                   c.name AS customer_name, c.email, c.phone, c.address 
            FROM quotations q
            JOIN customers c ON q.customer_id = c.id
            WHERE q.id = $1 AND q.company_id = $2
            `,
            [id, company_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Quotation not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Update a quotation
// PUT http://localhost:3000/api/quotations/1
// Content-Type: application/json

// {
//     "quote_number": "QTN-001",
//     "customer_id": 1,
//     "quote_date": "2024-11-25",
//     "status": "approved",
//     "company_id": 1
// }

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { quote_number, customer_id, quote_date, status, company_id } = req.body;

    if (!company_id) {
        return res.status(400).json({ error: 'company_id is required' });
    }

    try {
        const result = await pool.query(
            `
            UPDATE quotations
            SET quote_number = $1, customer_id = $2, quote_date = $3, status = $4
            WHERE id = $5 AND company_id = $6 RETURNING *
            `,
            [quote_number, customer_id, quote_date, status, id, company_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Quotation not found or does not belong to the specified company' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a quotation
// DELETE http://localhost:3000/api/quotations/1?company_id=1
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { company_id } = req.query; // Extract company_id from query

    if (!company_id) {
        return res.status(400).json({ error: 'company_id is required' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM quotations WHERE id = $1 AND company_id = $2 RETURNING *',
            [id, company_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Quotation not found or does not belong to the specified company' });
        }
        res.json({ message: 'Quotation deleted', quotation: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
