-- ===========================================
-- Create and use schema
-- ===========================================
CREATE DATABASE IF NOT EXISTS project5dbv1;
USE project5dbv1;

-- ===========================================
-- Drop tables if they exist (in safe order)
-- ===========================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS ItemReq;
DROP TABLE IF EXISTS ChosenTrait;
DROP TABLE IF EXISTS InquiryFormResponse;
DROP TABLE IF EXISTS InquiryForm;
DROP TABLE IF EXISTS IdentifyingTrait;
DROP TABLE IF EXISTS Trait;
DROP TABLE IF EXISTS Ghost;
DROP TABLE IF EXISTS TeamReview;
DROP TABLE IF EXISTS RentalReview;
DROP TABLE IF EXISTS ProductReview;
DROP TABLE IF EXISTS StockOrder;
DROP TABLE IF EXISTS ProductStock;
DROP TABLE IF EXISTS ServiceTransaction;
DROP TABLE IF EXISTS ItemTransaction;
DROP TABLE IF EXISTS Service;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS CustomerAddress;
DROP TABLE IF EXISTS MaintenanceEvent;
DROP TABLE IF EXISTS RentedEquipment;
DROP TABLE IF EXISTS Rental;
DROP TABLE IF EXISTS Vehicle;
DROP TABLE IF EXISTS Equipment;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS Team;
DROP TABLE IF EXISTS CustomerAccount;

SET FOREIGN_KEY_CHECKS = 1;

-- ===========================================
-- Base tables

-- TODO
-- fix chosentrait (what does this do??)
-- ===========================================

CREATE TABLE CustomerAccount (
  AccountID INT AUTO_INCREMENT PRIMARY KEY,
  Email VARCHAR(255) NOT NULL UNIQUE,
  Username VARCHAR(100) NOT NULL UNIQUE,
  PasswordHash VARCHAR(255) NOT NULL,
  Status ENUM('active','inactive','banned') DEFAULT 'active',
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Team (
  TeamID INT AUTO_INCREMENT PRIMARY KEY,
  TeamName VARCHAR(150) NOT NULL,
  Description TEXT,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Product (
  ProductID INT AUTO_INCREMENT PRIMARY KEY,
  ProductName VARCHAR(150) NOT NULL,
  ProductDescription TEXT,
  Price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Equipment (
  EquipmentID INT AUTO_INCREMENT PRIMARY KEY,
  ProductID INT,
  Name VARCHAR(150) NOT NULL,
  Description TEXT,
  Qty INT NOT NULL DEFAULT 1,
  RentalStatus ENUM('available','rented','maintenance','retired') DEFAULT 'available',
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

CREATE TABLE Vehicle (
  VehicleID INT AUTO_INCREMENT PRIMARY KEY,
  EquipmentID INT NOT NULL UNIQUE,
  Year SMALLINT,
  Make VARCHAR(100),
  Model VARCHAR(100),
  Odometer INT,
  VIN VARCHAR(50),
  LicensePlate VARCHAR(30),
  FOREIGN KEY (EquipmentID) REFERENCES Equipment(EquipmentID)
);

CREATE TABLE Rental (
  RentalID INT AUTO_INCREMENT PRIMARY KEY,
  CustomerID INT NOT NULL,
  BillingAddressID INT,
  Scope VARCHAR(255),
  StartDate DATE,
  EndDate DATE,
  Status VARCHAR(50),
  Note TEXT,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (CustomerID) REFERENCES CustomerAccount(AccountID)
);

CREATE TABLE RentedEquipment (
  RentedEquipmentID INT AUTO_INCREMENT PRIMARY KEY,
  RentalID INT NOT NULL,
  EquipmentID INT NOT NULL,
  RentalRate DECIMAL(10,2) DEFAULT 0.00,
  EquipmentDamageFee DECIMAL(10,2) DEFAULT 0.00,
  EquipmentSecurityFee DECIMAL(10,2) DEFAULT 0.00,
  FOREIGN KEY (RentalID) REFERENCES Rental(RentalID),
  FOREIGN KEY (EquipmentID) REFERENCES Equipment(EquipmentID)
);

CREATE TABLE MaintenanceEvent (
  MaintenanceEventID INT AUTO_INCREMENT PRIMARY KEY,
  EquipmentID INT NOT NULL,
  RentalID INT,
  LastServiceDate DATE,
  NextServiceDate DATE,
  EventStatus VARCHAR(100),
  OpenedAt DATETIME,
  ClosedAt DATETIME,
  MaintenanceOutcome TEXT,
  Notes TEXT,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (EquipmentID) REFERENCES Equipment(EquipmentID),
  FOREIGN KEY (RentalID) REFERENCES Rental(RentalID)
);

CREATE TABLE CustomerAddress (
  AddressID INT AUTO_INCREMENT PRIMARY KEY,
  AccountID INT NOT NULL,
  Line1 VARCHAR(255),
  Line2 VARCHAR(255),
  City VARCHAR(100),
  ProvinceState VARCHAR(100),
  PostalCode VARCHAR(20),
  Country VARCHAR(100),
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (AccountID) REFERENCES CustomerAccount(AccountID)
);

CREATE TABLE Payment (
  PaymentID INT AUTO_INCREMENT PRIMARY KEY,
  AccountID INT NOT NULL,
  BillingAddressID INT,
  CardLast4 CHAR(4),
  CardToken VARCHAR(255),
  PaymentMethod ENUM('credit_card','debit','cash','e-transfer') DEFAULT 'credit_card',
  Amount DECIMAL(10,2),
  PaidAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (AccountID) REFERENCES CustomerAccount(AccountID),
  FOREIGN KEY (BillingAddressID) REFERENCES CustomerAddress(AddressID)
);

CREATE TABLE Service (
  ServiceID INT AUTO_INCREMENT PRIMARY KEY,
  ServiceName VARCHAR(150) NOT NULL,
  Description TEXT,
  BaseRate DECIMAL(10,2),
  TeamID INT,
  FOREIGN KEY (TeamID) REFERENCES Team(TeamID)
);

CREATE TABLE ItemTransaction (
  ItemTransactionID INT AUTO_INCREMENT PRIMARY KEY,
  PaymentID INT NOT NULL,
  ProductID INT,
  Quantity INT DEFAULT 1,
  Subtotal DECIMAL(10,2),
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (PaymentID) REFERENCES Payment(PaymentID),
  FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

CREATE TABLE ServiceTransaction (
  ServiceTransactionID INT AUTO_INCREMENT PRIMARY KEY,
  PaymentID INT NOT NULL,
  ServiceID INT,
  HoursWorked DECIMAL(5,2),
  Subtotal DECIMAL(10,2),
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (PaymentID) REFERENCES Payment(PaymentID),
  FOREIGN KEY (ServiceID) REFERENCES Service(ServiceID)
);

CREATE TABLE ProductStock (
  StockID INT AUTO_INCREMENT PRIMARY KEY,
  ProductID INT NOT NULL,
  QuantityAvailable INT DEFAULT 0,
  RestockThreshold INT DEFAULT 10,
  LastRestockDate DATE,
  FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

CREATE TABLE StockOrder (
  StockOrderID INT AUTO_INCREMENT PRIMARY KEY,
  ProductID INT NOT NULL,
  QuantityOrdered INT,
  SupplierName VARCHAR(150),
  OrderedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  ReceivedAt DATETIME,
  FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

CREATE TABLE ProductReview (
  ReviewID INT AUTO_INCREMENT PRIMARY KEY,
  ProductID INT NOT NULL,
  AccountID INT NOT NULL,
  Rating INT CHECK (Rating BETWEEN 1 AND 5),
  Comment TEXT,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ProductID) REFERENCES Product(ProductID),
  FOREIGN KEY (AccountID) REFERENCES CustomerAccount(AccountID)
);

CREATE TABLE RentalReview (
  ReviewID INT AUTO_INCREMENT PRIMARY KEY,
  RentalID INT NOT NULL,
  AccountID INT NOT NULL,
  Rating INT CHECK (Rating BETWEEN 1 AND 5),
  Comment TEXT,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (RentalID) REFERENCES Rental(RentalID),
  FOREIGN KEY (AccountID) REFERENCES CustomerAccount(AccountID)
);

CREATE TABLE TeamReview (
  ReviewID INT AUTO_INCREMENT PRIMARY KEY,
  TeamID INT NOT NULL,
  AccountID INT NOT NULL,
  Rating INT CHECK (Rating BETWEEN 1 AND 5),
  Comment TEXT,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (TeamID) REFERENCES Team(TeamID),
  FOREIGN KEY (AccountID) REFERENCES CustomerAccount(AccountID)
);

CREATE TABLE Ghost (
  GhostID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(150) NOT NULL,
  Description TEXT,
  ThreatLevel ENUM('low','medium','high') DEFAULT 'medium',
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Trait (
  TraitID INT AUTO_INCREMENT PRIMARY KEY,
  TraitName VARCHAR(150) NOT NULL,
  TraitType ENUM('physical','behavioral','paranormal') DEFAULT 'paranormal'
);

CREATE TABLE IdentifyingTrait (
  GhostID INT NOT NULL,
  TraitID INT NOT NULL,
  PRIMARY KEY (GhostID, TraitID),
  FOREIGN KEY (GhostID) REFERENCES Ghost(GhostID),
  FOREIGN KEY (TraitID) REFERENCES Trait(TraitID)
);

CREATE TABLE ChosenTrait (
  TraitID INT NOT NULL,
  InquiryFormResponseID INT NOT NULL,
  PRIMARY KEY (TraitID, InquiryFormResponseID),
  FOREIGN KEY (TraitID) REFERENCES Trait(TraitID)
  -- FK to InquiryFormResponse added below once table exists
);

CREATE TABLE InquiryForm (
  InquiryFormID INT AUTO_INCREMENT PRIMARY KEY,
  CustomerID INT NOT NULL,
  Description TEXT,
  SubmittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (CustomerID) REFERENCES CustomerAccount(AccountID)
);

CREATE TABLE InquiryFormResponse (
  InquiryFormResponseID INT AUTO_INCREMENT PRIMARY KEY,
  InquiryFormID INT, 
  CustomerID INT NOT NULL,
  GhostID INT,
  Description TEXT,
  SubmittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (InquiryFormID) REFERENCES InquiryForm(InquiryFormID),
  FOREIGN KEY (CustomerID) REFERENCES CustomerAccount(AccountID),
  FOREIGN KEY (GhostID) REFERENCES Ghost(GhostID)
);

-- need to fix these
ALTER TABLE ChosenTrait
  ADD CONSTRAINT fk_chosentrait_inquiry FOREIGN KEY (InquiryFormResponseID)
  REFERENCES InquiryFormResponse(InquiryFormResponseID);

CREATE TABLE ItemReq (
  ItemReqID INT AUTO_INCREMENT PRIMARY KEY,
  EquipmentID INT,
  ServiceID INT,
  Quantity INT DEFAULT 1,
  Notes TEXT,
  FOREIGN KEY (EquipmentID) REFERENCES Equipment(EquipmentID),
  FOREIGN KEY (ServiceID) REFERENCES Service(ServiceID)
);
