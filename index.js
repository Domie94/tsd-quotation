const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const customersRoute = require('./routes/customers');
const productsRoute = require('./routes/products');
const quotationsRoute = require('./routes/quotations');
const quotationItemsRoute = require('./routes/quotation_items');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Directory to store the uploaded file
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save file in the uploads directory
  },
  filename: (req, file, cb) => {
    cb(null, 'logo.png'); // Overwrite with "logo.png"
  },
});
const upload = multer({ storage });

app.use(cors({
    origin: '*' // Replace with your frontend URL
  }));

  app.post('/api/logo', upload.single('logo'), (req, res) => {
    res.json({ message: 'Logo uploaded successfully!', path: `/uploads/logo.png` });
  });
  
  // API to retrieve the logo
  app.get('/api/logo', (req, res) => {
    const logoPath = path.join(uploadDir, 'logo.png');
    if (fs.existsSync(logoPath)) {
      res.sendFile(logoPath);
    } else {
      res.status(404).json({ message: 'Logo not found!' });
    }
  });
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
