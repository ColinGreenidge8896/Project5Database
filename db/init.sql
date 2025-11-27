-- ===========================================
-- Create and use schema
-- ===========================================
CREATE DATABASE IF NOT EXISTS project5dbv1;
USE project5dbv1;

-- ===========================================
-- Drop tables if they exist (in safe order)
-- ===========================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS Roles;
DROP TABLE IF EXISTS ItemReq;
DROP TABLE IF EXISTS ChosenTrait;
DROP TABLE IF EXISTS InquiryFormResponse;
DROP TABLE IF EXISTS InquiryForm;
DROP TABLE IF EXISTS IdentifyingTrait;
DROP TABLE IF EXISTS Trait;
DROP TABLE IF EXISTS Ghost;
DROP TABLE IF EXISTS ServiceReview;
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
-- TODO

-- fix logic in vehicle, equipment
-- add foreign key restrictions NOT NULL? why vs why not?
-- cascade on delete for certain tables? customerAccount deletes forms etc.?
-- create review table, then make each review type use the review table? move out repeated code (AccountID + rating)
-- validation for entries (product price not negative, rental start date > end date)
-- ===========================================
CREATE TABLE Roles (
  RoleID INT AUTO_INCREMENT PRIMARY KEY,
  RoleName VARCHAR(100) UNIQUE NOT NULL
);

-- linux roles here - adjust to server implementation
INSERT INTO Roles (RoleName)
VALUES ('admin'), ('inventory'), ('pos'), ('fleet'), ('ghost_diagnostics');

CREATE TABLE CustomerAccount (
  AccountID INT AUTO_INCREMENT PRIMARY KEY,
  Email VARCHAR(255) NOT NULL UNIQUE,
  Username VARCHAR(100) NOT NULL UNIQUE,
  PasswordHash VARCHAR(255) NOT NULL,
  Status ENUM('active','inactive','banned') DEFAULT 'active',
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
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
  FOREIGN KEY (AccountID) REFERENCES CustomerAccount(AccountID),
  
  -- REQUIRED to allow composite FK from Rental
  UNIQUE (AddressID, AccountID)
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

-- is this a type of equipment or individual units? 
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

-- Equipment can be linked to vehicle by entire category, not individual equipment items
-- also does a vehicle need equipment tied to it?? just tie everything together in a Service table entry
CREATE TABLE Vehicle (
  VehicleID INT AUTO_INCREMENT PRIMARY KEY,
  EquipmentID INT NOT NULL,
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
  
  FOREIGN KEY (CustomerID) REFERENCES CustomerAccount(AccountID),
  -- combined foreign key to make sure that referenced rentals are to correct customer and address
  FOREIGN KEY (BillingAddressID, CustomerID)
      REFERENCES CustomerAddress(AddressID, AccountID)
);

-- remove ability to rent same equipment over and over - use UNIQUE
CREATE TABLE RentedEquipment (
  RentedEquipmentID INT AUTO_INCREMENT PRIMARY KEY,
  RentalID INT NOT NULL,
  EquipmentID INT NOT NULL,
  UNIQUE (RentalID, EquipmentID),
  RentalRate DECIMAL(10,2) DEFAULT 0.00,
  EquipmentDamageFee DECIMAL(10,2) DEFAULT 0.00,
  EquipmentSecurityFee DECIMAL(10,2) DEFAULT 0.00,
  FOREIGN KEY (RentalID) REFERENCES Rental(RentalID),
  FOREIGN KEY (EquipmentID) REFERENCES Equipment(EquipmentID)
);

-- tie entries to either requipment or rental, otherwise "floating" events possible
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
  FOREIGN KEY (BillingAddressID, AccountID)
    REFERENCES CustomerAddress(AddressID, AccountID)
);

-- service table for services performed - ghost diagnostics table
CREATE TABLE Service (
  ServiceID INT AUTO_INCREMENT PRIMARY KEY,
  ServiceName VARCHAR(150) NOT NULL,
  Description TEXT,
  BaseRate DECIMAL(10,2),
  TeamID INT,
  FOREIGN KEY (TeamID) REFERENCES Team(TeamID)
);

-- CustomerService - Ghost Diagnostics table for customer and service mix 
CREATE TABLE CustomerService (
  CustomerServiceID int AUTO_INCREMENT PRIMARY KEY,
  ServiceID int NOT NULL,
  AccountID int NOT NULL,
  FOREIGN KEY (ServiceID) REFERENCES Service(ServiceID),
  FOREIGN key (AccountID) REFERENCES CustomerAccount(AccountID)
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

-- also make equipmentstock table? 
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

CREATE TABLE ServiceReview (
  ReviewID INT AUTO_INCREMENT PRIMARY KEY,
  ServiceID INT NOT NULL,
  AccountID INT NOT NULL,
  Rating INT CHECK (Rating BETWEEN 1 AND 5),
  Comment TEXT,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ServiceID) REFERENCES Service(ServiceID),
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

CREATE TABLE InquiryForm (
  InquiryFormID INT AUTO_INCREMENT PRIMARY KEY,
  AccountID INT,
  Description TEXT,
  SubmittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (AccountID) REFERENCES CustomerAccount(AccountID)
);

CREATE TABLE InquiryFormResponse (
  InquiryFormResponseID INT AUTO_INCREMENT PRIMARY KEY,
  InquiryFormID INT, 
  GhostID INT,
  Description TEXT,
  SubmittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (InquiryFormID) REFERENCES InquiryForm(InquiryFormID),
  FOREIGN KEY (GhostID) REFERENCES Ghost(GhostID)
);

-- requested implementation from ghost diag team - can change to combined primary key if needed
CREATE TABLE ChosenTrait (
  ChosenTraitID INT AUTO_INCREMENT PRIMARY KEY,
  InquiryFormID INT,
  TraitID INT,
  UNIQUE (InquiryFormID, TraitID),
  FOREIGN KEY (InquiryFormID) REFERENCES InquiryForm(InquiryFormID),
  FOREIGN KEY (TraitID) REFERENCES Trait(TraitID)
);

CREATE TABLE RemovalMethod (
  RemovalMethodID INT AUTO_INCREMENT PRIMARY KEY,
  GhostID int,
  ServiceID int,
  FOREIGN KEY (GhostID) REFERENCES Ghost(GhostID),
  FOREIGN KEY (ServiceID) REFERENCES Service(ServiceID)
);

-- who accesses this table?
CREATE TABLE ItemReq (
  ItemReqID INT AUTO_INCREMENT PRIMARY KEY,
  EquipmentID INT,
  ServiceID INT,
  Quantity INT DEFAULT 1,
  Notes TEXT,
  FOREIGN KEY (EquipmentID) REFERENCES Equipment(EquipmentID),
  FOREIGN KEY (ServiceID) REFERENCES Service(ServiceID)
);

-- inserting ghost and trait data
INSERT INTO Ghost (GhostID, GhostName, Description) VALUES
('None', 'This is NOT a supernatural entity'),
('Phantom', 'A ghost known for its frightening appearance and habit of watching the living, but otherwise harmless demeanor.'),
('Wraith', 'A ghost known for its strong aura of dread and doom, with the feeling often persisting until you leave the wraith’s haunting grounds.'),
('Poltergeist', 'A ghost known for its ability to manipulate objects, often throwing items, slamming doors, or turning lights on and off.'),
('Banshee', 'A ghost with a frightening, potentially dangerous wail, known for driving people off cliffs as they run in fear.'),
('Revenant', 'A ghost with a physical presence, aggressive and capable of harming people directly. Highly dangerous.');

INSERT INTO Trait (TraitID, TraitName) VALUES
('Strange Cold Spots'),
('Flickering Lights'),
('Seeing Disappearing Figures'),
('Doors Slamming On Their Own'),
('Disembodied Screaming'),
('Floating Objects'),
('Feeling of Intense Dread/Impending Doom'),
('Physical Attack'),
('Sense of Being Watched');

INSERT INTO Equipment (EquipmentID, EquipmentName) VALUES
('Salt'),
('Candy'),
('Doorstops / Wedges'),
('Helmet'),
('Religious Symbol'),
('Earplugs'),
('Body Armour'),
('Video Camera'),
('EVP Recorder'),
('EMF Reader'),
('Holy Text'),
('Flashlight'),
('Radios');

-- Traits for None (ghost_ID 0)
INSERT INTO IdentifyingTrait (GhostID, TraitID) VALUES
(0, 0), -- Strange Cold Spots
(0, 1); -- Flickering Lights

-- Traits for Phantom (ghost_ID 1)
INSERT INTO IdentifyingTrait (GhostID, TraitID) VALUES
(1, 0), -- Strange Cold Spots
(1, 1), -- Flickering Lights
(1, 2), -- Seeing Disappearing Figures
(1, 8); -- Sense of Being Watched

-- Traits for Wraith (ghost_ID 2)
INSERT INTO IdentifyingTrait (GhostID, TraitID) VALUES
(2, 0), -- Strange Cold Spots
(2, 1), -- Flickering Lights
(2, 6); -- Feeling of Intense Dread/Impending Doom

-- Traits for Poltergeist (ghost_ID 3)
INSERT INTO IdentifyingTrait (GhostID, TraitID) VALUES
(3, 0), -- Strange Cold Spots
(3, 1), -- Flickering Lights
(3, 5), -- Floating Objects
(3, 3); -- Doors Slamming On Their Own

-- Traits for Banshee (ghost_ID 4)
INSERT INTO IdentifyingTrait (GhostID, TraitID) VALUES
(4, 0), -- Strange Cold Spots
(4, 1), -- Flickering Lights
(4, 4), -- Disembodied Screaming
(4, 8); -- Sense of Being Watched

-- Traits for Revenant (ghost_ID 5)
INSERT INTO IdentifyingTrait (GhostID, TraitID) VALUES
(5, 0), -- Strange Cold Spots
(5, 1), -- Flickering Lights
(5, 7), -- Physical Attack
(5, 2), -- Seeing Disappearing Figures
(5, 8); -- Sense of Being Watched
