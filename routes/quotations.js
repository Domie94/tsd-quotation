const express = require('express');
const pool = require('../db');
const router = express.Router();

// Create a new quotation
router.post('/', async (req, res) => {
    const { quote_number, customer_id, quote_date, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO quotations (quote_number, customer_id, quote_date, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [quote_number, customer_id, quote_date, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all quotations
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT q.id AS quotation_id, q.quote_number, q.quote_date, q.status, 
                   c.name AS customer_name 
            FROM quotations q
            JOIN customers c ON q.customer_id = c.id
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single quotation by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `
            SELECT q.id AS quotation_id, q.quote_number, q.quote_date, q.status, 
                   c.name AS customer_name, c.email, c.phone, c.address 
            FROM quotations q
            JOIN customers c ON q.customer_id = c.id
            WHERE q.id = $1
            `,
            [id]
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
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { quote_number, customer_id, quote_date, status } = req.body;
    try {
        const result = await pool.query(
            `
            UPDATE quotations
            SET quote_number = $1, customer_id = $2, quote_date = $3, status = $4
            WHERE id = $5 RETURNING *
            `,
            [quote_number, customer_id, quote_date, status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Quotation not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a quotation
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM quotations WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Quotation not found' });
        }
        res.json({ message: 'Quotation deleted', quotation: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
