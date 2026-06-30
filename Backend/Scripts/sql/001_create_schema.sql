-- Step 1: Create the database first (run on postgres database):
-- CREATE DATABASE "Sub_Rev_db";

-- Step 2: Connect to Sub_Rev_db, then run this file.

-- Drop tables in reverse order (child tables first)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS users;

-- 1. Users table (Defines the user and their role)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Applications table (The created applications, with default Draft for new applications)
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2),
    requested_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT NOW(),
    submitted_at TIMESTAMP
);

-- 3. Audit log table (Keeps track of all the audits, on the status transition)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id),
    actor_id INTEGER NOT NULL REFERENCES users(id),
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
