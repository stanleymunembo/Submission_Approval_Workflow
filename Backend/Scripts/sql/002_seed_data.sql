-- Run this AFTER 001_create_schema.sql
--
-- Login details:
--   applicant@demo.com / Password123!
--   reviewer@demo.com  / Password123!

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Clear old seed data and reset IDs to 1, 2, 3...
TRUNCATE audit_logs, applications, users RESTART IDENTITY CASCADE;

-- STEP 1: Users
INSERT INTO users (email, password_hash, full_name, role) VALUES
('applicant@demo.com', crypt('Password123!', gen_salt('bf')), 'Jane Applicant', 'applicant'),
('reviewer@demo.com', crypt('Password123!', gen_salt('bf')), 'Ray Reviewer', 'reviewer');

-- STEP 2: Applications (uses applicant email to find owner_id)
INSERT INTO applications (owner_id, title, category, description, amount, requested_date, status, submitted_at)
VALUES (
    (SELECT id FROM users WHERE email = 'applicant@demo.com'),
    'Office laptop upgrade',
    'Equipment',
    'Need a laptop for development work.',
    1200.00,
    NULL,
    'DRAFT',
    NULL
);

INSERT INTO applications (owner_id, title, category, description, amount, requested_date, status, submitted_at)
VALUES (
    (SELECT id FROM users WHERE email = 'applicant@demo.com'),
    'Conference travel',
    'Travel',
    'Travel for developer conference.',
    850.00,
    NULL,
    'SUBMITTED',
    NOW()
);

INSERT INTO applications (owner_id, title, category, description, amount, requested_date, status, submitted_at)
VALUES (
    (SELECT id FROM users WHERE email = 'applicant@demo.com'),
    'Security training',
    'Training',
    'Team security training.',
    NULL,
    '2026-07-28',
    'UNDER_REVIEW',
    NOW()
);

-- STEP 3: Audit logs (uses application title + user email to find IDs)
INSERT INTO audit_logs (application_id, actor_id, old_status, new_status, comment)
VALUES (
    (SELECT id FROM applications WHERE title = 'Conference travel'),
    (SELECT id FROM users WHERE email = 'applicant@demo.com'),
    'DRAFT',
    'SUBMITTED',
    NULL
);

INSERT INTO audit_logs (application_id, actor_id, old_status, new_status, comment)
VALUES (
    (SELECT id FROM applications WHERE title = 'Security training'),
    (SELECT id FROM users WHERE email = 'applicant@demo.com'),
    'DRAFT',
    'SUBMITTED',
    NULL
);

INSERT INTO audit_logs (application_id, actor_id, old_status, new_status, comment)
VALUES (
    (SELECT id FROM applications WHERE title = 'Security training'),
    (SELECT id FROM users WHERE email = 'reviewer@demo.com'),
    'SUBMITTED',
    'UNDER_REVIEW',
    'Review started.'
);
