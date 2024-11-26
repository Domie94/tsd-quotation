const express = require('express');
const pool = require('../db');
const router = express.Router();

// Create a new customer
router.post('/', async (req, res) => {
    const { name, email, phone, address } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO customers (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, phone, address]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all customers
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customers');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a customer by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a customer
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    try {
        const result = await pool.query(
            'UPDATE customers SET name = $1, email = $2, phone = $3, address = $4 WHERE id = $5 RETURNING *',
            [name, email, phone, address, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a customer
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted', customer: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
