const express = require('express');
const pool = require('../db');
const router = express.Router();

// Create a new quotation item
router.post('/', async (req, res) => {
    const { quotation_id, product_id, quantity } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO quotation_items (quotation_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
            [quotation_id, product_id, quantity]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all items for a quotation
router.get('/:quotation_id', async (req, res) => {
    const { quotation_id } = req.params;
    try {
        const result = await pool.query(
            `
            SELECT qi.id AS item_id, qi.quantity, 
                   p.name AS product_name, p.unit_price, 
                   (qi.quantity * p.unit_price) AS total_price
            FROM quotation_items qi
            JOIN products p ON qi.product_id = p.id
            WHERE qi.quotation_id = $1
            `,
            [quotation_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a quotation item
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { quotation_id, product_id, quantity } = req.body;
    try {
        const result = await pool.query(
            `
            UPDATE quotation_items
            SET quotation_id = $1, product_id = $2, quantity = $3
            WHERE id = $4 RETURNING *
            `,
            [quotation_id, product_id, quantity, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Quotation item not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a quotation item
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM quotation_items WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Quotation item not found' });
        }
        res.json({ message: 'Quotation item deleted', item: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
