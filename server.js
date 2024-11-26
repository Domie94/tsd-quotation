const express = require('express');
const bodyParser = require('body-parser');
const customersRoute = require('./routes/customers');
const productsRoute = require('./routes/products');
const quotationsRoute = require('./routes/quotations');
const quotationItemsRoute = require('./routes/quotation_items');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/customers', customersRoute);
app.use('/api/products', productsRoute);
app.use('/api/quotations', quotationsRoute);
app.use('/api/quotation_items', quotationItemsRoute);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
