const express = require('express');
const pool = require('../db');
const router = express.Router();

// Create a new quotation item
// POST http://localhost:3000/api/quotation-items
// Content-Type: application/json

// {
//     "quotation_id": 1,
//     "name": "Product A",
//     "quantity": 5,
//     "description": "Description of Product A",
//     "unit_price": 100,
//     "company_id": 1
// }
router.post('/', async (req, res) => {
    const { quotation_id, name, quantity, description, unit_price, company_id } = req.body;

    // Validate that company_id is provided
    if (!company_id) {
        return res.status(400).json({ error: 'company_id is required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO quotation_items (quotation_id, name, quantity, description, unit_price, company_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [quotation_id, name, quantity, description, unit_price, company_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get all items for a quotation
// GET http://localhost:3000/api/quotation-items/1?company_id=1
router.get('/:quotation_id', async (req, res) => {
    const { quotation_id } = req.params;
    const { company_id } = req.query; // Extract company_id from query parameters

    // Validate that company_id is provided
    if (!company_id) {
        return res.status(400).json({ error: 'company_id is required' });
    }

    try {
        const result = await pool.query(
            `
            SELECT
                qi.id AS item_id,
                qi.quantity,
                qi.name AS product_name,
                qi.unit_price,
                qi.description,
                (qi.quantity * qi.unit_price) AS total_price
            FROM quotation_items qi
            WHERE qi.quotation_id = $1 AND qi.company_id = $2
            `,
            [quotation_id, company_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Update a quotation item
// PUT http://localhost:3000/api/quotation-items/1
// Content-Type: application/json

// {
//     "quotation_id": 1,
//     "name": "Updated Product A",
//     "quantity": 10,
//     "description": "Updated Description",
//     "unit_price": 150,
//     "company_id": 1
// }

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { quotation_id, name, quantity, description, unit_price, company_id } = req.body;

    // Validate that company_id is provided
    if (!company_id) {
        return res.status(400).json({ error: 'company_id is required' });
    }

    try {
        const result = await pool.query(
            `
            UPDATE quotation_items
            SET quotation_id = $1, name = $2, quantity = $3, description = $4, unit_price = $5
            WHERE id = $6 AND company_id = $7 RETURNING *
            `,
            [quotation_id, name, quantity, description, unit_price, id, company_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Quotation item not found or does not belong to the specified company' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a quotation item
// DELETE http://localhost:3000/api/quotation-items/1?company_id=1
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { company_id } = req.query; // Extract company_id from query parameters

    // Validate that company_id is provided
    if (!company_id) {
        return res.status(400).json({ error: 'company_id is required' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM quotation_items WHERE id = $1 AND company_id = $2 RETURNING *',
            [id, company_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Quotation item not found or does not belong to the specified company' });
        }
        res.json({ message: 'Quotation item deleted', item: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
