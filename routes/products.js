const express = require('express');
const pool = require('../db');
const router = express.Router();

// Create a new product
// POST http://localhost:3000/api/products
// Content-Type: application/json

// {
//     "name": "Product A",
//     "description": "Description of Product A",
//     "unit_price": 100,
//     "company_id": 1
// }
router.post('/', async (req, res) => {
    const { name, description, unit_price, company_id } = req.body;

    // Validate if company_id is provided
    if (!company_id) {
        return res.status(400).json({ error: 'company_id is required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO products (name, description, unit_price, company_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, unit_price, company_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all products
// GET http://localhost:3000/api/products?page=1&company_id=1
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Number of items per page
        const offset = (page - 1) * limit;
        const companyId = req.query.company_id; // Get company_id from query

        if (!companyId) {
            return res.status(400).json({ error: 'company_id is required' });
        }

        // Fetch total number of records for the specified company
        const totalResult = await pool.query('SELECT COUNT(*) FROM products WHERE company_id = $1', [companyId]);
        const totalRecords = parseInt(totalResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalRecords / limit);

        // Fetch paginated results
        const result = await pool.query(
            'SELECT * FROM products WHERE company_id = $1 LIMIT $2 OFFSET $3',
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


// Get a product by ID
// GET http://localhost:3000/api/products/1?company_id=1
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { company_id } = req.query; // Extract company_id from query

    if (!company_id) {
        return res.status(400).json({ error: 'company_id is required' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM products WHERE id = $1 AND company_id = $2',
            [id, company_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Update a product
// PUT http://localhost:3000/api/products/1
// Content-Type: application/json

// {
//     "name": "Updated Product A",
//     "description": "Updated description",
//     "unit_price": 150,
//     "company_id": 1
// }
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, unit_price, company_id } = req.body;

    if (!company_id) {
        return res.status(400).json({ error: 'company_id is required' });
    }

    try {
        const result = await pool.query(
            'UPDATE products SET name = $1, description = $2, unit_price = $3 WHERE id = $4 AND company_id = $5 RETURNING *',
            [name, description, unit_price, id, company_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found or does not belong to the specified company' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a product
// DELETE http://localhost:3000/api/products/1?company_id=1
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { company_id } = req.query; // Extract company_id from query

    if (!company_id) {
        return res.status(400).json({ error: 'company_id is required' });
    }

    try {
        const result = await pool.query(
            'DELETE FROM products WHERE id = $1 AND company_id = $2 RETURNING *',
            [id, company_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found or does not belong to the specified company' });
        }
        res.json({ message: 'Product deleted', product: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
