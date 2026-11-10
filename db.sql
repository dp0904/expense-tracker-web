CREATE DATABASE ExpenseTrackerDB;

USE ExpenseTrackerDB;

CREATE TABLE TblEntries (
	EntryID INT AUTO_INCREMENT PRIMARY KEY,
    EntryDate DATE NOT NULL,
    Amount DECIMAL(10, 2) NOT NULL,
    Category VARCHAR(2) NOT NULL,
    Description VARCHAR(250) NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_category CHECK (Category IN ('E', 'I')),
    CONSTRAINT chk_amount CHECK (Amount > 0)
);

SELECT * FROM TblEntries;