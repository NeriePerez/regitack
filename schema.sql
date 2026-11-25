CREATE DATABASE IF NOT EXISTS registrar_document_system
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE registrar_document_system;

-- =========================================
-- 1. ROLES
-- =========================================

CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 2. USERS
-- =========================================

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    account_status ENUM('Active', 'Inactive', 'Locked')
        DEFAULT 'Active',
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_roles
        FOREIGN KEY (role_id)
        REFERENCES roles(role_id)
);

-- =========================================
-- 3. STUDENTS
-- =========================================

CREATE TABLE IF NOT EXISTS students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    student_number VARCHAR(50) NOT NULL UNIQUE,
    program VARCHAR(150),
    year_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_students_users
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- =========================================
-- 4. REGISTRAR STAFF
-- =========================================

CREATE TABLE IF NOT EXISTS registrar_staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    employee_number VARCHAR(50) UNIQUE,
    department VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_staff_users
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- =========================================
-- 5. DOCUMENTS
-- =========================================

CREATE TABLE IF NOT EXISTS documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    document_name VARCHAR(150) NOT NULL,
    document_code VARCHAR(50) UNIQUE,
    description TEXT,
    processing_days INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================
-- 6. DOCUMENT FEES
-- =========================================

CREATE TABLE IF NOT EXISTS document_fees (
    fee_id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    effective_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_fees_documents
        FOREIGN KEY (document_id)
        REFERENCES documents(document_id)
);

-- =========================================
-- 7. DOCUMENT REQUIREMENTS
-- =========================================

CREATE TABLE IF NOT EXISTS document_requirements (
    requirement_id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    requirement_text VARCHAR(255) NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_requirements_documents
        FOREIGN KEY (document_id)
        REFERENCES documents(document_id)
);

-- =========================================
-- 8. SYSTEM SETTINGS
-- =========================================

CREATE TABLE IF NOT EXISTS system_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);



-- 9. DOCUMENT REQUESTS
CREATE TABLE IF NOT EXISTS document_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    reference_number VARCHAR(50) NOT NULL UNIQUE,
    student_id INT NOT NULL,
    document_id INT NOT NULL,

    purpose TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,

    status ENUM(
        'Submitted',
        'Under Review',
        'Processing',
        'Ready for Pickup',
        'Released',
        'Rejected',
        'Cancelled',
        'On Hold'
    ) DEFAULT 'Submitted',

    total_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    remarks TEXT NULL,

    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_requests_students
        FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_requests_documents
        FOREIGN KEY (document_id)
        REFERENCES documents(document_id)
);

-- 10. REQUEST STATUS HISTORY
CREATE TABLE IF NOT EXISTS request_status_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INT NULL,
    remarks TEXT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_history_requests
        FOREIGN KEY (request_id)
        REFERENCES document_requests(request_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_history_users
        FOREIGN KEY (changed_by)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);

