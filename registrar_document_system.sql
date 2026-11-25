-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 25, 2026 at 12:24 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `registrar_document_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `audit_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `actor_email` varchar(190) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`audit_id`, `user_id`, `actor_email`, `action`, `details`, `ip_address`, `created_at`) VALUES
(1, 2, 'student@email.com', 'Demo data seeded', 'Initial Regitrack sample data was inserted.', NULL, '2026-11-22 08:00:00'),
(2, 3, 'registrar@email.com', 'Demo data seeded', 'Registrar demo account and sample workflow initialized.', NULL, '2026-11-22 08:00:00'),
(3, 4, 'admin@regitrack.edu.ph', 'Demo data seeded', 'Administrator demo account initialized.', NULL, '2026-11-22 08:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `document_id` int(11) NOT NULL,
  `document_name` varchar(150) NOT NULL,
  `document_code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `processing_days` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`document_id`, `document_name`, `document_code`, `description`, `processing_days`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Transcript of Records', 'TOR', 'Official record of all your grades.', 5, 1, '2026-11-22 10:20:32', '2026-11-22 13:16:40'),
(2, 'Certificate of Enrollment', 'F137', 'Proof you are enrolled this term.', 1, 1, '2026-11-22 10:20:32', '2026-11-22 13:16:40'),
(3, 'Certificate of Grades', 'COE', 'Grades for a single term.', 2, 1, '2026-11-22 10:20:32', '2026-11-22 13:16:40'),
(4, 'Good Moral Certificate', 'COG', 'Character and conduct clearance.', 2, 1, '2026-11-22 10:20:32', '2026-11-22 13:16:40'),
(5, 'Diploma (Certified Copy)', 'CGM', 'Certified true copy of your diploma.', 7, 1, '2026-11-22 10:20:32', '2026-11-22 13:16:40'),
(6, 'Form 137', 'FORM-137', 'Permanent record for transfers.', 3, 1, '2026-11-22 13:16:40', '2026-11-22 13:16:40');

-- --------------------------------------------------------

--
-- Table structure for table `document_fees`
--

CREATE TABLE `document_fees` (
  `fee_id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `effective_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_fees`
--

INSERT INTO `document_fees` (`fee_id`, `document_id`, `amount`, `effective_date`, `is_active`, `created_at`) VALUES
(1, 1, 150.00, '2026-11-22', 1, '2026-11-22 10:20:32'),
(2, 2, 50.00, '2026-11-22', 1, '2026-11-22 10:20:32'),
(3, 3, 50.00, '2026-11-22', 1, '2026-11-22 10:20:32'),
(4, 4, 60.00, '2026-11-22', 1, '2026-11-22 10:20:32'),
(5, 5, 200.00, '2026-11-22', 1, '2026-11-22 10:20:32'),
(6, 6, 100.00, '2026-11-22', 1, '2026-11-22 13:16:40');

-- --------------------------------------------------------

--
-- Table structure for table `document_requests`
--

CREATE TABLE `document_requests` (
  `request_id` int(11) NOT NULL,
  `reference_number` varchar(50) NOT NULL,
  `student_id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `purpose` text NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `status` enum('Submitted','Under Review','Processing','Ready for Pickup','Released','Rejected','Cancelled','On Hold') DEFAULT 'Submitted',
  `total_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `remarks` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ready_at` timestamp NULL DEFAULT NULL,
  `released_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_requests`
--

INSERT INTO `document_requests` (`request_id`, `reference_number`, `student_id`, `document_id`, `purpose`, `quantity`, `status`, `total_fee`, `remarks`, `submitted_at`, `ready_at`, `released_at`) VALUES
(1, 'RG-4K9A2X', 1, 1, 'Employment', 1, 'Processing', 150.00, 'Document preparation is in progress.', '2026-11-08 01:12:00', NULL, NULL),
(2, 'RG-8TQ1ZM', 1, 2, 'Scholarship', 1, 'Ready for Pickup', 50.00, 'Bring your valid ID when claiming.', '2026-11-02 00:30:00', '2026-11-22 07:30:00', NULL),
(3, 'RG-2PW7LC', 1, 4, 'Employment', 1, 'Released', 60.00, 'Document released to student.', '2026-10-21 02:15:00', '2026-10-22 03:00:00', '2026-10-23 06:30:00'),
(4, 'RG-9XD3HB', 1, 3, 'Scholarship', 1, 'Rejected', 50.00, 'Missing ID copy.', '2026-10-12 03:00:00', NULL, NULL),
(5, 'RG-6LM4QW', 1, 6, 'Transfer', 1, 'Released', 100.00, 'Illustrative demo request and release.', '2026-09-28 01:00:00', '2026-09-29 06:00:00', '2026-09-30 02:15:00'),
(48, 'RG-2JU2Q8', 3, 6, 'School admission', 2, 'Submitted', 200.00, NULL, '2026-11-24 13:42:59', NULL, NULL),
(51, 'RG-CUM6OK', 3, 4, 'Scholarship application', 1, 'Submitted', 60.00, NULL, '2026-11-24 14:11:17', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `document_requirements`
--

CREATE TABLE `document_requirements` (
  `requirement_id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `requirement_text` varchar(255) NOT NULL,
  `is_required` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_requirements`
--

INSERT INTO `document_requirements` (`requirement_id`, `document_id`, `requirement_text`, `is_required`, `created_at`) VALUES
(1, 1, 'Valid school ID or government ID', 1, '2026-11-22 13:16:40'),
(2, 1, 'Cleared accountabilities', 1, '2026-11-22 13:16:40'),
(3, 1, 'Request letter (for alumni)', 0, '2026-11-22 13:16:40'),
(4, 2, 'Valid school ID', 1, '2026-11-22 13:16:40'),
(5, 2, 'Currently enrolled status', 1, '2026-11-22 13:16:40'),
(6, 3, 'Valid school ID', 1, '2026-11-22 13:16:40'),
(7, 3, 'Term/semester to be covered', 1, '2026-11-22 13:16:40'),
(8, 4, 'Valid ID', 1, '2026-11-22 13:16:40'),
(9, 4, 'Clearance from the Student Affairs Office', 1, '2026-11-22 13:16:40'),
(10, 5, 'Valid ID', 1, '2026-11-22 13:16:40'),
(11, 5, 'Photocopy of original diploma', 1, '2026-11-22 13:16:40'),
(12, 5, 'Request letter', 1, '2026-11-22 13:16:40'),
(13, 6, 'Valid ID', 1, '2026-11-22 13:16:40'),
(14, 6, 'Authorization letter if claimed by a representative', 0, '2026-11-22 13:16:40');

-- --------------------------------------------------------

--
-- Table structure for table `document_types`
--

CREATE TABLE `document_types` (
  `document_type_id` smallint(5) UNSIGNED NOT NULL,
  `document_name` varchar(150) NOT NULL,
  `category` enum('records','certs','forms') NOT NULL,
  `description` varchar(255) NOT NULL,
  `fee_per_copy` decimal(10,2) NOT NULL,
  `processing_time` varchar(40) NOT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_types`
--

INSERT INTO `document_types` (`document_type_id`, `document_name`, `category`, `description`, `fee_per_copy`, `processing_time`, `is_available`, `created_at`) VALUES
(1, 'Transcript of Records', 'records', 'Official record of all your grades.', 150.00, '3–5 days', 1, '2026-11-22 13:01:55'),
(2, 'Certificate of Enrollment', 'certs', 'Proof you are enrolled this term.', 50.00, '1 day', 1, '2026-11-22 13:01:55'),
(3, 'Certificate of Grades', 'certs', 'Grades for a single term.', 50.00, '1–2 days', 1, '2026-11-22 13:01:55'),
(4, 'Good Moral Certificate', 'certs', 'Character and conduct clearance.', 60.00, '2 days', 1, '2026-11-22 13:01:55'),
(5, 'Diploma (Certified Copy)', 'records', 'Certified true copy of your diploma.', 200.00, '5–7 days', 1, '2026-11-22 13:01:55'),
(6, 'Form 137', 'forms', 'Permanent record for transfers.', 100.00, '3 days', 1, '2026-11-22 13:01:55');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `request_id` int(11) DEFAULT NULL,
  `title` varchar(180) NOT NULL,
  `message` varchar(500) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `request_id`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, 2, 2, 'Certificate of Enrollment is ready', 'Your Certificate of Enrollment is ready. Pick it up at the registrar window.', 0, '2026-11-22 08:00:00'),
(2, 2, 1, 'Transcript of Records is processing', 'Your Transcript of Records is now being processed. Step 3 of 5.', 0, '2026-11-22 09:12:00'),
(3, 2, 1, 'Request submitted', 'Your request for a Transcript of Records has been submitted.', 1, '2026-11-08 09:12:00'),
(4, 2, 4, 'Certificate of Grades was rejected', 'Your request was rejected because the ID copy is missing.', 1, '2026-10-13 13:00:00'),
(5, 2, NULL, 'Welcome to Regitrack', 'Your account is ready.', 1, '2026-10-01 08:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `qr_tokens`
--

CREATE TABLE `qr_tokens` (
  `qr_token_id` int(11) NOT NULL,
  `request_id` int(11) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `qr_tokens`
--

INSERT INTO `qr_tokens` (`qr_token_id`, `request_id`, `token_hash`, `expires_at`, `used_at`, `created_at`) VALUES
(1, 2, 'fcc1da95bb91051c805872afed39c1a8745f0ce72ecdaf005467d0c84a98e10d', '2026-11-30 23:59:59', NULL, '2026-11-22 15:12:57');

-- --------------------------------------------------------

--
-- Table structure for table `registrar_staff`
--

CREATE TABLE `registrar_staff` (
  `staff_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `employee_number` varchar(50) DEFAULT NULL,
  `department` varchar(150) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `registrar_staff`
--

INSERT INTO `registrar_staff` (`staff_id`, `user_id`, `employee_number`, `department`, `created_at`) VALUES
(1, 3, 'DEMO-REG-001', 'Office of the Registrar', '2026-11-22 13:16:40');

-- --------------------------------------------------------

--
-- Table structure for table `request_details`
--

CREATE TABLE `request_details` (
  `details_id` int(11) NOT NULL,
  `reference_code` varchar(50) NOT NULL,
  `pickup_date` date NOT NULL,
  `progress_step` tinyint(3) UNSIGNED NOT NULL DEFAULT 1,
  `rejection_reason` varchar(255) DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `released_by` int(11) DEFAULT NULL,
  `released_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `request_details`
--

INSERT INTO `request_details` (`details_id`, `reference_code`, `pickup_date`, `progress_step`, `rejection_reason`, `reviewed_by`, `reviewed_at`, `released_by`, `released_at`, `created_at`, `updated_at`) VALUES
(1, 'RG-4K9A2X', '2026-11-14', 3, NULL, 2, '2026-11-09 10:00:00', NULL, NULL, '2026-11-22 15:08:21', '2026-11-22 15:08:21'),
(2, 'RG-8TQ1ZM', '2026-11-14', 5, NULL, 2, '2026-11-03 09:00:00', NULL, NULL, '2026-11-22 15:08:21', '2026-11-22 15:08:21'),
(3, 'RG-2PW7LC', '2026-10-28', 5, NULL, 2, '2026-10-22 09:00:00', 2, '2026-10-28 14:00:00', '2026-11-22 15:08:21', '2026-11-22 15:08:21'),
(4, 'RG-9XD3HB', '0000-00-00', 2, 'Missing ID copy', 2, '2026-10-13 13:00:00', NULL, NULL, '2026-11-22 15:08:21', '2026-11-22 15:08:21'),
(5, 'RG-6LM4QW', '2026-10-05', 5, NULL, 2, '2026-09-29 10:00:00', 2, '2026-10-05 15:00:00', '2026-11-22 15:08:21', '2026-11-22 15:08:21'),
(48, 'RG-2JU2Q8', '2026-11-27', 1, NULL, NULL, NULL, NULL, NULL, '2026-11-24 13:42:59', '2026-11-24 13:42:59'),
(51, 'RG-CUM6OK', '2026-11-26', 1, NULL, NULL, NULL, NULL, NULL, '2026-11-24 14:11:17', '2026-11-24 14:11:17');

-- --------------------------------------------------------

--
-- Table structure for table `request_status_history`
--

CREATE TABLE `request_status_history` (
  `history_id` int(11) NOT NULL,
  `request_id` int(11) NOT NULL,
  `previous_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `request_status_history`
--

INSERT INTO `request_status_history` (`history_id`, `request_id`, `previous_status`, `new_status`, `changed_by`, `remarks`, `changed_at`) VALUES
(1, 1, NULL, 'Submitted', NULL, 'Request submitted by student.', '2026-11-08 01:12:00'),
(2, 1, 'Submitted', 'Under Review', 2, 'Request reviewed by registrar.', '2026-11-08 05:00:00'),
(3, 1, 'Under Review', 'Processing', 2, 'Document preparation in progress.', '2026-11-09 02:00:00'),
(4, 2, NULL, 'Submitted', NULL, 'Request submitted by student.', '2026-11-02 00:30:00'),
(5, 2, 'Submitted', 'Under Review', 2, 'Request reviewed by registrar.', '2026-11-02 05:00:00'),
(6, 2, 'Under Review', 'Ready for Pickup', 2, 'Document is ready for collection.', '2026-11-03 01:00:00'),
(7, 3, NULL, 'Submitted', NULL, 'Request submitted by student.', '2026-10-21 02:15:00'),
(8, 3, 'Submitted', 'Released', 2, 'Document released to student.', '2026-10-28 06:00:00'),
(9, 4, NULL, 'Submitted', NULL, 'Request submitted by student.', '2026-10-12 03:00:00'),
(10, 4, 'Submitted', 'Rejected', 2, 'Missing ID copy.', '2026-10-13 05:00:00'),
(11, 5, NULL, 'Submitted', NULL, 'Illustrative demo request.', '2026-09-28 01:00:00'),
(12, 5, 'Submitted', 'Released', 2, 'Illustrative demo release.', '2026-10-05 07:00:00'),
(35, 48, NULL, 'Submitted', 6, 'Request submitted by student.', '2026-11-24 13:42:59'),
(38, 51, NULL, 'Submitted', 6, 'Request submitted by student.', '2026-11-24 14:11:17');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `description`, `created_at`) VALUES
(1, 'Student', 'Student account', '2026-11-22 10:20:32'),
(2, 'Registrar Staff', 'Registrar personnel', '2026-11-22 10:20:32'),
(3, 'Admin', 'System administrator', '2026-11-22 10:20:32');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `student_number` varchar(50) NOT NULL,
  `program` varchar(150) DEFAULT NULL,
  `year_level` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `user_id`, `student_number`, `program`, `year_level`, `created_at`) VALUES
(1, 2, '2026-001', 'Bachelor of Science in Information Technology', '2nd Year', '2026-11-22 15:02:26'),
(3, 6, '2020-0002', 'Bachelor of Science in Entrepreneurship', '2nd Year', '2026-11-24 01:15:49');

-- --------------------------------------------------------

--
-- Table structure for table `student_profiles`
--

CREATE TABLE `student_profiles` (
  `student_profile_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `student_number` varchar(40) NOT NULL,
  `program` varchar(120) DEFAULT NULL,
  `year_level` varchar(30) DEFAULT NULL,
  `department` varchar(120) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `setting_id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`setting_id`, `setting_key`, `setting_value`, `updated_at`) VALUES
(1, 'system_name', 'Regitrack', '2026-11-22 13:16:40'),
(2, 'default_processing_preference', 'Within 2 weeks', '2026-11-22 13:16:40'),
(3, 'qr_token_validity_days', '7', '2026-11-22 13:16:40'),
(4, 'demo_mode', 'true', '2026-11-22 13:16:40');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `account_status` enum('Active','Inactive','Locked') DEFAULT 'Active',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `role_id`, `full_name`, `email`, `password_hash`, `account_status`, `last_login`, `created_at`, `updated_at`) VALUES
(2, 1, 'Sam Smith Rivera', 'sam@email.com', '$2b$12$pnZguEXVtJZrsIQhZteLcOeIuNkR6GJNiFs2L7.WoavUyHIGRHQL.', 'Active', '2026-11-25 18:43:14', '2026-11-22 12:54:30', '2026-11-25 10:43:14'),
(3, 2, 'Regitrack Administrator', 'registrar@email.com', '$2b$12$Y8HOJPVxAAxWgr84ObYBMeK02X.nqHPJuCT1sZBjaOnJsi/imyUSm', 'Active', '2026-11-24 07:41:18', '2026-11-22 12:54:30', '2026-11-23 23:41:18'),
(4, 3, 'Regitrack Administrator', 'admin@regitrack.edu.ph', '$2b$12$Fx00L04y6isAbcMWjQR0kOEab/.A2qYqN9YymRwBOxmP7sKvNlu4S', 'Active', '2026-11-24 07:42:39', '2026-11-22 12:54:30', '2026-11-23 23:42:39'),
(6, 1, 'Jane Doe', 'jane@email.com', '$2b$12$6.9FK2Z9BPyNPd6LgoQdXu9epoQ0tFy/LY8tDGqxVnu2YxBPmS20.', 'Active', '2026-11-24 21:06:27', '2026-11-24 01:15:49', '2026-11-24 13:06:27');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_request_details`
-- (See below for the actual view)
--
CREATE TABLE `v_request_details` (
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_student_request_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_student_request_summary` (
`student_id` int(11)
,`user_id` int(11)
,`full_name` varchar(150)
,`student_number` varchar(50)
,`all_time_requests` bigint(21)
,`active_requests` decimal(23,0)
,`ready_requests` decimal(23,0)
,`released_requests` decimal(23,0)
,`rejected_requests` decimal(23,0)
);

-- --------------------------------------------------------

--
-- Structure for view `v_request_details`
--
DROP TABLE IF EXISTS `v_request_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_request_details`  AS SELECT `dr`.`request_id` AS `request_id`, `dr`.`reference_number` AS `reference_number`, `dr`.`student_id` AS `student_id`, `s`.`student_number` AS `student_number`, `u`.`full_name` AS `student_name`, `u`.`email` AS `student_email`, `d`.`document_id` AS `document_id`, `d`.`document_name` AS `document_name`, `d`.`document_code` AS `document_code`, `dr`.`purpose` AS `purpose`, `dr`.`quantity` AS `quantity`, `dr`.`total_fee` AS `total_fee`, `dr`.`status` AS `status`, `dr`.`remarks` AS `remarks`, `dr`.`submitted_at` AS `submitted_at`, `dr`.`updated_at` AS `updated_at`, `rd`.`pickup_date` AS `pickup_date`, `rd`.`processing_preference` AS `processing_preference`, `rd`.`fee_per_copy_snapshot` AS `fee_per_copy_snapshot`, `rd`.`progress_step` AS `progress_step`, `rd`.`progress_total` AS `progress_total`, `rd`.`rejection_reason` AS `rejection_reason`, `rd`.`reviewed_by` AS `reviewed_by`, `rd`.`reviewed_at` AS `reviewed_at`, `rd`.`released_by` AS `released_by`, `rd`.`released_at` AS `released_at` FROM ((((`document_requests` `dr` join `students` `s` on(`s`.`student_id` = `dr`.`student_id`)) join `users` `u` on(`u`.`user_id` = `s`.`user_id`)) join `documents` `d` on(`d`.`document_id` = `dr`.`document_id`)) left join `request_details` `rd` on(`rd`.`request_id` = `dr`.`request_id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `v_student_request_summary`
--
DROP TABLE IF EXISTS `v_student_request_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_student_request_summary`  AS SELECT `s`.`student_id` AS `student_id`, `u`.`user_id` AS `user_id`, `u`.`full_name` AS `full_name`, `s`.`student_number` AS `student_number`, count(`dr`.`request_id`) AS `all_time_requests`, coalesce(sum(`dr`.`status` in ('Submitted','Under Review','Processing','On Hold')),0) AS `active_requests`, coalesce(sum(`dr`.`status` = 'Ready for Pickup'),0) AS `ready_requests`, coalesce(sum(`dr`.`status` = 'Released'),0) AS `released_requests`, coalesce(sum(`dr`.`status` = 'Rejected'),0) AS `rejected_requests` FROM ((`students` `s` join `users` `u` on(`u`.`user_id` = `s`.`user_id`)) left join `document_requests` `dr` on(`dr`.`student_id` = `s`.`student_id`)) GROUP BY `s`.`student_id`, `u`.`user_id`, `u`.`full_name`, `s`.`student_number` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`audit_id`),
  ADD KEY `fk_audit_logs_users` (`user_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`document_id`),
  ADD UNIQUE KEY `document_code` (`document_code`);

--
-- Indexes for table `document_fees`
--
ALTER TABLE `document_fees`
  ADD PRIMARY KEY (`fee_id`),
  ADD KEY `fk_fees_documents` (`document_id`);

--
-- Indexes for table `document_requests`
--
ALTER TABLE `document_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD UNIQUE KEY `reference_number` (`reference_number`),
  ADD KEY `fk_requests_students` (`student_id`),
  ADD KEY `fk_requests_documents` (`document_id`);

--
-- Indexes for table `document_requirements`
--
ALTER TABLE `document_requirements`
  ADD PRIMARY KEY (`requirement_id`),
  ADD KEY `fk_requirements_documents` (`document_id`);

--
-- Indexes for table `document_types`
--
ALTER TABLE `document_types`
  ADD PRIMARY KEY (`document_type_id`),
  ADD UNIQUE KEY `document_name` (`document_name`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `fk_notifications_users` (`user_id`),
  ADD KEY `fk_notifications_requests` (`request_id`);

--
-- Indexes for table `qr_tokens`
--
ALTER TABLE `qr_tokens`
  ADD PRIMARY KEY (`qr_token_id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `fk_qr_tokens_requests` (`request_id`);

--
-- Indexes for table `registrar_staff`
--
ALTER TABLE `registrar_staff`
  ADD PRIMARY KEY (`staff_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `employee_number` (`employee_number`);

--
-- Indexes for table `request_details`
--
ALTER TABLE `request_details`
  ADD PRIMARY KEY (`details_id`),
  ADD UNIQUE KEY `reference_code` (`reference_code`),
  ADD KEY `fk_request_details_reviewer` (`reviewed_by`),
  ADD KEY `fk_request_details_releaser` (`released_by`);

--
-- Indexes for table `request_status_history`
--
ALTER TABLE `request_status_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `fk_history_requests` (`request_id`),
  ADD KEY `fk_history_users` (`changed_by`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `student_number` (`student_number`);

--
-- Indexes for table `student_profiles`
--
ALTER TABLE `student_profiles`
  ADD PRIMARY KEY (`student_profile_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `student_number` (`student_number`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`setting_id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_roles` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `audit_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `document_fees`
--
ALTER TABLE `document_fees`
  MODIFY `fee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `document_requests`
--
ALTER TABLE `document_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `document_requirements`
--
ALTER TABLE `document_requirements`
  MODIFY `requirement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `document_types`
--
ALTER TABLE `document_types`
  MODIFY `document_type_id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `qr_tokens`
--
ALTER TABLE `qr_tokens`
  MODIFY `qr_token_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `registrar_staff`
--
ALTER TABLE `registrar_staff`
  MODIFY `staff_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `request_status_history`
--
ALTER TABLE `request_status_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `student_profiles`
--
ALTER TABLE `student_profiles`
  MODIFY `student_profile_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `setting_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_logs_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `document_fees`
--
ALTER TABLE `document_fees`
  ADD CONSTRAINT `fk_fees_documents` FOREIGN KEY (`document_id`) REFERENCES `documents` (`document_id`);

--
-- Constraints for table `document_requests`
--
ALTER TABLE `document_requests`
  ADD CONSTRAINT `fk_requests_documents` FOREIGN KEY (`document_id`) REFERENCES `documents` (`document_id`),
  ADD CONSTRAINT `fk_requests_students` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- Constraints for table `document_requirements`
--
ALTER TABLE `document_requirements`
  ADD CONSTRAINT `fk_requirements_documents` FOREIGN KEY (`document_id`) REFERENCES `documents` (`document_id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_requests` FOREIGN KEY (`request_id`) REFERENCES `document_requests` (`request_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_notifications_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `qr_tokens`
--
ALTER TABLE `qr_tokens`
  ADD CONSTRAINT `fk_qr_tokens_requests` FOREIGN KEY (`request_id`) REFERENCES `document_requests` (`request_id`) ON DELETE CASCADE;

--
-- Constraints for table `registrar_staff`
--
ALTER TABLE `registrar_staff`
  ADD CONSTRAINT `fk_staff_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `request_details`
--
ALTER TABLE `request_details`
  ADD CONSTRAINT `fk_request_details_releaser` FOREIGN KEY (`released_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_request_details_request` FOREIGN KEY (`details_id`) REFERENCES `document_requests` (`request_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_request_details_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `request_status_history`
--
ALTER TABLE `request_status_history`
  ADD CONSTRAINT `fk_history_requests` FOREIGN KEY (`request_id`) REFERENCES `document_requests` (`request_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_history_users` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `fk_students_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `student_profiles`
--
ALTER TABLE `student_profiles`
  ADD CONSTRAINT `fk_student_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
