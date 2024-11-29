-- Companies Table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,             -- Company name
    email VARCHAR(100) UNIQUE,             -- Company email
    phone VARCHAR(15),                     -- Company phone number
    address TEXT,                          -- Company address
    tax_id VARCHAR(12),                    -- Tax ID or registration number
    logo_url TEXT,                         -- URL to the company logo
    signature_url TEXT,                    -- URL to the company's signature
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    address TEXT,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE, -- Reference to the company
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products/Services Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    unit_price NUMERIC(12, 2) NOT NULL,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE, -- Reference to the company
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotations Table
CREATE TABLE quotations (
    id SERIAL PRIMARY KEY,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
    quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'pending', -- e.g., pending, approved, rejected
    company_id INT REFERENCES companies(id) ON DELETE CASCADE, -- Reference to the company
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotation Items Table
CREATE TABLE quotation_items (
    id SERIAL PRIMARY KEY,
    quotation_id INT REFERENCES quotations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    description TEXT,
    unit_price NUMERIC(12, 2) NOT NULL,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE, -- Reference to the company
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (Optional)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'staff', -- e.g., admin, staff
    company_id INT REFERENCES companies(id) ON DELETE CASCADE, -- Reference to the company
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION generate_quote_number(company_id INT)
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    next_number INT;
    quote_number TEXT;
BEGIN
    -- Get the last two digits of the current year
    current_year := TO_CHAR(CURRENT_DATE, 'YY');

    -- Calculate the next sequence number for the current year and company
    SELECT COALESCE(MAX(SUBSTRING(quote_number FROM '[0-9]+$')::INT), 0) + 1
    INTO next_number
    FROM quotations
    WHERE company_id = company_id AND SUBSTRING(quote_number FROM '^[0-9]+') = current_year;

    -- Generate the quote number in the format YY-0001
    quote_number := current_year || '-' || LPAD(next_number::TEXT, 4, '0');

    RETURN quote_number;
END;
$$ LANGUAGE plpgsql;
