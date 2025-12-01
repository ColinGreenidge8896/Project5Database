-- ===========================================
-- Create and use schema
-- ===========================================
CREATE DATABASE IF NOT EXISTS mydatabase;
USE mydatabase;

-- ===========================================
-- Drop tables if they exist (in safe order)
-- ===========================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS Roles;
DROP TABLE IF EXISTS CustomerAccount;
DROP TABLE IF EXISTS CustomerAddress;
DROP TABLE IF EXISTS Team;

DROP TABLE IF EXISTS Equipment;
-- DROP TABLE IF EXISTS Vehicle;
DROP TABLE IF EXISTS Rental;
DROP TABLE IF EXISTS RentedEquipment;
DROP TABLE IF EXISTS Maintenance;
DROP TABLE IF EXISTS Employee;

DROP TABLE IF EXISTS Service;
DROP TABLE IF EXISTS CustomerService;

DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS ItemTransaction;
DROP TABLE IF EXISTS ServiceTransaction;

DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS ProductStock;
DROP TABLE IF EXISTS StockOrder;

DROP TABLE IF EXISTS ProductReview;
DROP TABLE IF EXISTS RentalReview;
DROP TABLE IF EXISTS ServiceReview;

DROP TABLE IF EXISTS Ghost;
DROP TABLE IF EXISTS Trait;
DROP TABLE IF EXISTS IdentifyingTrait;
DROP TABLE IF EXISTS InquiryForm;
DROP TABLE IF EXISTS InquiryFormResponse;
DROP TABLE IF EXISTS ChosenTrait;
DROP TABLE IF EXISTS RemovalMethod;
DROP TABLE IF EXISTS ItemReq;

SET FOREIGN_KEY_CHECKS = 1;

-- needed to allow backend to connect
DROP USER IF EXISTS 'myuser'@'%';
CREATE USER 'myuser'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON mydatabase.* TO 'myuser'@'%';
FLUSH PRIVILEGES;


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

CREATE TABLE Employee (
  EmployeeID INT AUTO_INCREMENT PRIMARY KEY,
  EmployeeName VARCHAR(100) NOT NULL,
  Username VARCHAR(50) NOT NULL,
  Password VARCHAR(200) NOT NULL,

  CONSTRAINT UQ_Employee_Username UNIQUE (Username)
);

CREATE TABLE Team (
  TeamID INT AUTO_INCREMENT PRIMARY KEY,
  TeamName VARCHAR(150) NOT NULL,
  TeamDescription TEXT,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Product (
  ProductID INT AUTO_INCREMENT PRIMARY KEY,
  ProductName VARCHAR(150) NOT NULL,
  ProductDescription TEXT,
  Price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
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

-- is this a type of equipment or individual units? 
CREATE TABLE Equipment (
  EquipmentID INT AUTO_INCREMENT PRIMARY KEY,
  EquipmentCode VARCHAR(32) NOT NULL,
  EquipmentName VARCHAR(100) NOT NULL,
  EquipmentDescription TEXT,
  EquipmentValue DECIMAL(12,2) NOT NULL,
  EquipmentCategory VARCHAR(50) NOT NULL,
  EquipmentType VARCHAR (50) NOT NULL,

  EquipmentTrackingId VARCHAR(100),
  EquipmentAvailability ENUM('Available','UnderMaintenance','OutForRental','Damaged','Unavailable') DEFAULT 'Available',
  
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT UQ_Equipment_EquipmentCode UNIQUE (EquipmentCode)
);

-- Equipment can be linked to vehicle by entire category, not individual equipment items
-- also does a vehicle need equipment tied to it?? just tie everything together in a Service table entry
-- CREATE TABLE Vehicle (
--   VehicleID INT AUTO_INCREMENT PRIMARY KEY,
--   EquipmentID INT NOT NULL,
--   Year SMALLINT,
--   Make VARCHAR(100),
--   Model VARCHAR(100),
--   Odometer INT,
--   VIN VARCHAR(50),
--   LicensePlate VARCHAR(30),
--   FOREIGN KEY (EquipmentID) REFERENCES Equipment(EquipmentID)
-- );

CREATE TABLE Rental (
  RentalID INT AUTO_INCREMENT PRIMARY KEY,
  RentalCode VARCHAR(32) NOT NULL,
  AccountID INT NOT NULL,

  StartDate DATE NOT NULL,
  EndDate DATE NOT NULL,

  RentalStatus ENUM('Reserved','CheckedOut','Returned','Overdue','Closed') DEFAULT 'Reserved',
  Notes TEXT,
  Scope ENUM('Internal','External') DEFAULT 'Internal',

  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT UQ_Rental_RentalCode UNIQUE (RentalCode),
  FOREIGN KEY (AccountID) REFERENCES CustomerAccount(AccountID)
);

-- remove ability to rent same equipment over and over - use UNIQUE
CREATE TABLE RentedEquipment (
  RentedEquipmentID INT AUTO_INCREMENT PRIMARY KEY,
  RentalID INT NOT NULL,
  EquipmentID INT NOT NULL,
  
  UNIQUE (RentalID, EquipmentID),

  FOREIGN KEY (RentalID) REFERENCES Rental(RentalID),
  FOREIGN KEY (EquipmentID) REFERENCES Equipment(EquipmentID)
);

-- tie entries to either requipment or rental, otherwise "floating" events possible
CREATE TABLE Maintenance (
  MaintenanceID INT AUTO_INCREMENT PRIMARY KEY,
  MaintenanceCode VARCHAR(32) NOT NULL,
  EquipmentID INT NOT NULL,
  RentalID INT,

  LastServiceDate DATE,
  NextServiceDate DATE,
  
  MaintenanceStatus ENUM('Open','Closed') DEFAULT 'Open',

  OpenedAt DATE NOT NULL,
  ClosedAt DATE,

  Outcome ENUM('Working','Damaged') DEFAULT 'Working',
  Technician VARCHAR(200),
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
  ServiceDescription TEXT,
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
  GhostName VARCHAR(150) NOT NULL,
  GhostDescription TEXT,
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
  InquiryFormDescription TEXT,
  SubmittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (AccountID) REFERENCES CustomerAccount(AccountID)
);

CREATE TABLE InquiryFormResponse (
  InquiryFormResponseID INT AUTO_INCREMENT PRIMARY KEY,
  InquiryFormID INT, 
  GhostID INT,
  InquiryFormResponseDescription TEXT,
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
INSERT INTO Ghost (GhostName, GhostDescription) VALUES
('None', 'This is NOT a supernatural entity'),
('Phantom', 'A ghost known for its frightening appearance and habit of watching the living, but otherwise harmless demeanor.'),
('Wraith', 'A ghost known for its strong aura of dread and doom, with the feeling often persisting until you leave the wraith’s haunting grounds.'),
('Poltergeist', 'A ghost known for its ability to manipulate objects, often throwing items, slamming doors, or turning lights on and off.'),
('Banshee', 'A ghost with a frightening, potentially dangerous wail, known for driving people off cliffs as they run in fear.'),
('Revenant', 'A ghost with a physical presence, aggressive and capable of harming people directly. Highly dangerous.');

-- SELECT * FROM GHOST;

INSERT INTO Trait (TraitName) VALUES
('Strange Cold Spots'),
('Flickering Lights'),
('Seeing Disappearing Figures'),
('Doors Slamming On Their Own'),
('Disembodied Screaming'),
('Floating Objects'),
('Feeling of Intense Dread/Impending Doom'),
('Physical Attack'),
('Sense of Being Watched');

-- SELECT * FROM Trait;

INSERT INTO Product (ProductName) VALUES
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

INSERT INTO Equipment (EquipmentCode, EquipmentName, EquipmentDescription, EquipmentValue, EquipmentCategory, EquipmentType, EquipmentTrackingId, EquipmentAvailability)
VALUES
('EQ-PKE-001','Mark I Proton Pack', 'Original 1984 model', 12000.00,                       'Containment', 'Proton Pack', 'PP-001-A', 'Available'),
('EQ-PKE-002','Mark II Proton Pack', 'Upgraded cyclotron', 15000.00,                       'Containment', 'Proton Pack', 'PP-002-B', 'Available'),
('EQ-PKE-003','Mark III Proton Pack', 'Enhanced plasma stream', 18000.00,                  'Containment', 'Proton Pack', 'PP-003-C', 'Available'),
('EQ-PKE-004','Experimental Proton Pack', 'Prototype safety model', 20000.00,              'Containment', 'Proton Pack', 'PP-004-X', 'Available'),
('EQ-PKE-005','Portable Proton Pack', 'Lightweight field unit', 14000.00,                  'Containment', 'Proton Pack', 'PP-005-L', 'Available'),
('EQ-TRP-001','Standard Ghost Trap', 'Original containment device', 8000.00,               'Containment', 'Ghost Trap', 'GT-001-S', 'Available'),
('EQ-TRP-002','Heavy Duty Ghost Trap', 'Reinforced for Class VII entities', 10000.00,      'Containment', 'Ghost Trap', 'GT-002-H', 'Available'),
('EQ-TRP-003','Multi-Capture Ghost Trap', 'Holds up to 3 entities', 12000.00,              'Containment', 'Ghost Trap', 'GT-003-M', 'Available'),
('EQ-TRP-004','Remote Activation Ghost Trap', 'Wireless trigger system', 9500.00,          'Containment', 'Ghost Trap', 'GT-004-R', 'Available'),
('EQ-TRP-005','Compact Ghost Trap', 'Pocket-sized emergency unit', 7000.00,                'Containment', 'Ghost Trap', 'GT-005-C', 'Available'),
('EQ-PKE-006','PKE Meter Model 1', 'Egon''s original design', 5000.00,                     'Detection', 'PKE Meter', 'PKE-M1-001', 'Available'),
('EQ-PKE-007','PKE Meter Model 2', 'Enhanced psychokinetic detection', 6500.00,            'Detection', 'PKE Meter', 'PKE-M2-002', 'Available'),
('EQ-PKE-008','PKE Meter Model 3', 'Digital readout upgrade', 7500.00,                     'Detection', 'PKE Meter', 'PKE-M3-003', 'Available'),
('EQ-PKE-009','Handheld PKE Scanner', 'Portable field scanner', 4500.00,                   'Detection', 'PKE Meter', 'PKE-H-004', 'Available'),
('EQ-PKE-010','Advanced PKE Array', 'Multi-spectrum analyzer', 9000.00,                    'Detection', 'PKE Meter', 'PKE-A-005', 'Available'),
('EQ-CTU-001','Main Containment Unit', 'Primary storage grid', 250000.00,                  'Storage', 'Containment Unit', 'MCU-HQ-001', 'Available'),
('EQ-CTU-002','Backup Containment Unit', 'Emergency failsafe system', 200000.00,           'Storage', 'Containment Unit', 'BCU-HQ-002', 'Available'),
('EQ-CTU-003','Mobile Containment Unit', 'Ecto-1 onboard storage', 150000.00,              'Storage', 'Containment Unit', 'MCU-E1-003', 'Available'),
('EQ-CTU-004','Portable Containment Module', 'Field deployment unit', 75000.00,            'Storage', 'Containment Unit', 'PCM-F-004', 'Available'),
('EQ-CTU-005','Experimental Laser Grid', 'High-capacity prototype', 300000.00,             'Storage', 'Containment Unit', 'ELG-LAB-005', 'Available'),
('EQ-ECT-001','Ecto-1', '1959 Cadillac Miller-Meteor ambulance', 50000.00,                 'Transportation', 'Vehicle', 'ECTO-1-MAIN', 'Available'),
('EQ-ECT-002','Ecto-1A', 'Updated version with roof rack', 55000.00,                       'Transportation', 'Vehicle', 'ECTO-1A-UPG', 'Available'),
('EQ-ECT-003','Ecto-1B', 'Backup vehicle for large operations', 52000.00,                  'Transportation', 'Vehicle', 'ECTO-1B-BKP', 'Available'),
('EQ-ECT-004','Ecto-Mobile', 'Motorcycle for urban response', 15000.00,                    'Transportation', 'Vehicle', 'ECTO-M-URB', 'Available'),
('EQ-ECT-005','Ecto-Copter', 'Helicopter for aerial surveillance', 250000.00,              'Transportation', 'Vehicle', 'ECTO-H-AIR', 'Available'),
('EQ-SLM-001','Slime Blower Mark I', 'Positive mood slime dispenser', 11000.00,            'Neutralization', 'Slime Blower', 'SB-001-P', 'Available'),
('EQ-SLM-002','Slime Blower Mark II', 'High-pressure slime cannon', 13000.00,              'Neutralization', 'Slime Blower', 'SB-002-H', 'Available'),
('EQ-SLM-003','Compact Slime Sprayer', 'Handheld slime applicator', 8000.00,               'Neutralization', 'Slime Blower', 'SB-003-C', 'Available'),
('EQ-SLM-004','Backpack Slime Unit', 'Portable mood slime reservoir', 10000.00,            'Neutralization', 'Slime Blower', 'SB-004-B', 'Available'),
('EQ-SLM-005','Industrial Slime Cannon', 'Large-scale deployment system', 25000.00,        'Neutralization', 'Slime Blower', 'SB-005-I', 'Available'),
('EQ-GOG-001','Ecto Goggles Standard', 'Basic spectral visualization', 3000.00,            'Detection', 'Ecto Goggles', 'EG-STD-001', 'Available'),
('EQ-GOG-002','Ecto Goggles Enhanced', 'Thermal and spectral imaging', 4500.00,            'Detection', 'Ecto Goggles', 'EG-ENH-002', 'Available'),
('EQ-GOG-003','Night Vision Ecto Goggles', 'Low-light operation', 5000.00,                 'Detection', 'Ecto Goggles', 'EG-NV-003', 'Available'),
('EQ-GOG-004','AR Ecto Goggles', 'Augmented reality overlay', 7500.00,                     'Detection', 'Ecto Goggles', 'EG-AR-004', 'Available'),
('EQ-GOG-005','VR Ecto Goggles', 'Full immersion spectral view', 10000.00,                 'Detection', 'Ecto Goggles', 'EG-VR-005', 'Available'),
('EQ-LAS-001','Containment Laser Grid Node', 'Single grid emitter', 15000.00,              'Containment', 'Laser Grid', 'LG-NODE-001', 'Available'),
('EQ-LAS-002','Portable Laser Fence', 'Temporary containment barrier', 12000.00,           'Containment', 'Laser Grid', 'LF-PORT-002', 'Available'),
('EQ-LAS-003','High-Power Laser Array', 'Industrial containment', 30000.00,                'Containment', 'Laser Grid', 'LA-HP-003', 'Available'),
('EQ-LAS-004','Tactical Laser Net', 'Deployable field containment', 18000.00,              'Containment', 'Laser Grid', 'LN-TAC-004', 'Available'),
('EQ-LAS-005','Experimental Plasma Fence', 'Prototype barrier system', 35000.00,           'Containment', 'Laser Grid', 'PF-EXP-005', 'Available'),
('EQ-BAT-001','Ectoplasmic Lure Standard', 'Basic ghost attractant', 500.00,               'Detection', 'Ghost Bait', 'GB-STD-001', 'Available'),
('EQ-BAT-002','Psychomagnetic Beacon', 'Strong entity attractor', 1500.00,                 'Detection', 'Ghost Bait', 'GB-PMB-002', 'Available'),
('EQ-BAT-003','Class V Spectral Lure', 'Targets specific entity types', 2000.00,           'Detection', 'Ghost Bait', 'GB-C5-003', 'Available'),
('EQ-BAT-004','Emotional Resonance Device', 'Attracts mood-based entities', 1800.00,       'Detection', 'Ghost Bait', 'GB-ERD-004', 'Available'),
('EQ-BAT-005','Universal Ghost Magnet', 'Wide-spectrum attractant', 2500.00,               'Detection', 'Ghost Bait', 'GB-UNI-005', 'Available'),
('EQ-COM-001','GB-COM Radio Unit 1', 'Primary team radio', 800.00,                         'Communication', 'Radio', 'RADIO-001', 'Available'),
('EQ-COM-002','GB-COM Radio Unit 2', 'Backup team radio', 800.00,                          'Communication', 'Radio', 'RADIO-002', 'Available'),
('EQ-COM-003','Encrypted Field Communicator', 'Secure channel device', 1200.00,            'Communication', 'Radio', 'RADIO-ENC-003', 'Available'),
('EQ-COM-004','Long-Range Relay Station', 'Extended communication range', 5000.00,         'Communication', 'Radio', 'RELAY-LR-004', 'Available'),
('EQ-COM-005','Satellite Uplink Module', 'Global communication', 10000.00,                 'Communication', 'Radio', 'SAT-COMM-005', 'Available'),
('EQ-MSC-001','Ecto-Plasma Sample Kit', 'Field collection equipment', 1000.00,             'Research', 'Sampling Kit', 'SPL-KIT-001', 'Available'),
('EQ-MSC-002','Paranormal Activity Monitor', 'Continuous ghost detection', 3500.00,        'Detection', 'Monitor', 'PAM-001', 'Available'),
('EQ-MSC-003','Ghost Vacuum', 'Small entity suction device', 4000.00,                      'Containment', 'Vacuum', 'GVAC-001', 'Available'),
('EQ-MSC-004','Ectoplasmic Residue Analyzer', 'Lab analysis equipment', 7500.00,           'Research', 'Analyzer', 'ERA-LAB-001', 'Available'),
('EQ-MSC-005','Spore Sample Collection Device', 'Mold and spore detector', 2500.00,        'Research', 'Collector', 'SPORE-001', 'Available'),
('EQ-MSC-006','Tobin''s Spirit Guide (Digital Edition)', 'Reference database', 500.00,     'Research', 'Database', 'TSG-DIG-001', 'Available'),
('EQ-MSC-007','Protective Hazmat Suit', 'Full-body ghost protection', 1500.00,             'Safety', 'Suit', 'HAZMAT-001', 'Available'),
('EQ-MSC-008','Anti-Psychokinetic Shell', 'Personal energy shield', 8000.00,               'Safety', 'Shield', 'APS-001', 'Available'),
('EQ-MSC-009','Emergency Ecto-Containment Box', 'Portable storage', 5000.00,               'Storage', 'Box', 'ECB-EMRG-001', 'Available'),
('EQ-MSC-010','Spectral Field Generator', 'Creates ghost-repelling field', 12000.00,        'Neutralization', 'Generator', 'SFG-001', 'Available');

    
INSERT INTO CustomerAccount (Email, Username, PasswordHash) VALUES
('mayor@nyc.gov',            'mayor.lenny', 'City@2024'),        
('wpeck@epa.gov',            'peck.epa', 'Shut#Down'),           
('j.hardemeyer@edu.gov',     'j.hardemeyer', 'Mayor#Aide'),      
('vigo@artmuseum.org',       'vigo.carpathian', 'Scourge#666'),  
('ivo@shandor.org',          'shandor.ghost', 'SECRETP@55'),     
('slimer@sedgewick.com',     'slimer', 'C@LLghost6'),            
('info@staypuft.com',        'stay.puft', 'Marsh#001'),          
('paranormal@columbia.edu',  'cu.research', 'Lab#2024'),         
('ladder8@nyfd.gov',         'ladder8.nyfd', 'Fire#Pole1'),      
('contact@rgb.tv',           'rgb.cartoon', 'Real#Heroes');

INSERT INTO CustomerAddress (AccountID, Line1, City, ProvinceState, PostalCode, Country) VALUES
(1, '123 City Hall Plaza', 'Toronto', 'Ontario', 'M5H 2N2', 'Canada'),
(2, '456 Environmental Way', 'Ottawa', 'Ontario', 'K1A 0H3', 'Canada'),
(3, '789 University Ave', 'Toronto', 'Ontario', 'M5G 1X8', 'Canada'),
(4, '1 Museum Drive', 'Toronto', 'Ontario', 'M5T 1P5', 'Canada'),
(5, '1214 Spook Central', 'Vancouver', 'British Columbia', 'V6B 2W9', 'Canada'),
(6, 'The Sedgewick Hotel', 'Vancouver', 'British Columbia', 'V6C 3L2', 'Canada'),
(7, '555 Marshmallow Blvd', 'Montreal', 'Quebec', 'H3B 1G5', 'Canada'),
(8, '100 College Walk', 'Toronto', 'Ontario', 'M5S 2E5', 'Canada'),
(9, '14 North Moore St', 'Toronto', 'Ontario', 'M4Y 1L1', 'Canada'),
(10, '222 Animation Studios', 'Vancouver', 'British Columbia', 'V5K 0A1', 'Canada');  

INSERT INTO Rental (RentalCode, AccountID, StartDate, EndDate, RentalStatus, Notes, Scope) VALUES
    ('RT-0001', 1, '2024-01-05', '2024-01-12', 'Closed', 'City Hall emergency ghost investigation', 'External'),
    ('RT-0002', 2, '2024-01-10', '2024-01-15', 'Closed', 'EPA compliance testing equipment', 'External'),
    ('RT-0003', 3, '2024-01-18', '2024-01-25', 'Closed', 'University paranormal research project', 'External'),
    ('RT-0004', 4, '2024-02-01', '2024-02-07', 'Closed', 'Museum spectral disturbance investigation', 'External'),
    ('RT-0005', 5, '2024-02-10', '2024-02-17', 'Closed', 'Shandor Building inspection', 'External'),
    ('RT-0006', 6, '2024-02-20', '2024-02-25', 'Closed', 'Sedgewick Hotel recurring haunting', 'External'),
    ('RT-0007', 7, '2024-03-01', '2024-03-08', 'Closed', 'Marshmallow factory paranormal event', 'External'),
    ('RT-0008', 8, '2024-03-12', '2024-03-19', 'Closed', 'Columbia University lab equipment rental', 'External'),
    ('RT-0009', 9, '2024-03-22', '2024-03-28', 'Closed', 'Fire station paranormal drill', 'External'),
    ('RT-0010', 10, '2024-04-01', '2024-04-07', 'Closed', 'Cartoon division training exercise', 'External'),
    ('RT-0011', 1, '2024-04-10', '2024-04-17', 'Closed', 'City-wide ghost sweep initiative', 'External'),
    ('RT-0012', 2, '2024-04-20', '2024-04-25', 'Closed', 'Environmental impact assessment', 'External'),
    ('RT-0013', 3, '2024-05-01', '2024-05-08', 'Closed', 'Academic research on Class IV entities', 'External'),
    ('RT-0014', 4, '2024-05-12', '2024-05-18', 'Closed', 'Art museum spectral cleanup', 'External'),
    ('RT-0015', 5, '2024-05-22', '2024-05-29', 'Closed', 'Cult headquarters investigation', 'External'),
    ('RT-0016', 6, '2024-06-01', '2024-06-07', 'Closed', 'Hotel ballroom ghost removal', 'External'),
    ('RT-0017', 7, '2024-06-10', '2024-06-17', 'Closed', 'Factory safety inspection equipment', 'External'),
    ('RT-0018', 8, '2024-06-20', '2024-06-27', 'Closed', 'University summer research program', 'External'),
    ('RT-0019', 9, '2024-07-01', '2024-07-08', 'Closed', 'Fire department training session', 'External'),
    ('RT-0020', 10, '2024-07-12', '2024-07-19', 'Closed', 'Media production equipment rental', 'External'),
    ('RT-0021', 1, '2024-07-22', '2024-07-29', 'Closed', 'Summer ghost festival preparation', 'External'),
    ('RT-0022', 2, '2024-08-01', '2024-08-08', 'Closed', 'EPA annual ghost count', 'External'),
    ('RT-0023', 3, '2024-08-12', '2024-08-19', 'Closed', 'Fall semester equipment setup', 'External'),
    ('RT-0024', 4, '2024-08-22', '2024-08-29', 'Closed', 'Museum night watch equipment', 'External'),
    ('RT-0025', 5, '2024-09-01', '2024-09-08', 'Closed', 'Building inspection and cleanup', 'External'),
    ('RT-0026', 6, '2024-09-12', '2024-09-19', 'Closed', 'Hotel convention ghost management', 'External'),
    ('RT-0027', 7, '2024-09-22', '2024-09-29', 'Closed', 'Product launch event safety', 'External'),
    ('RT-0028', 8, '2024-10-01', '2024-10-08', 'Closed', 'Research conference equipment', 'External'),
    ('RT-0029', 9, '2024-10-12', '2024-10-19', 'Closed', 'Halloween safety preparation', 'External'),
    ('RT-0030', 10, '2024-10-22', '2024-10-29', 'Closed', 'Fall filming equipment rental', 'External'),
    ('RT-0031', 1, '2024-11-01', '2024-11-07', 'Overdue', 'Equipment not returned on time', 'External'),
    ('RT-0032', 2, '2024-11-05', '2024-11-10', 'Overdue', 'Extended investigation equipment', 'External'),
    ('RT-0033', 3, '2024-11-08', '2024-11-12', 'Overdue', 'Research project delayed', 'External'),
    ('RT-0034', 4, '2024-11-10', '2024-11-15', 'Overdue', 'Museum closure extension', 'External'),
    ('RT-0035', 5, '2024-11-12', '2024-11-17', 'Overdue', 'Building investigation ongoing', 'External'),
    ('RT-0036', 6, '2024-11-14', '2024-11-19', 'Overdue', 'Hotel event extended', 'External'),
    ('RT-0037', 7, '2024-11-16', '2024-11-21', 'Overdue', 'Factory inspection incomplete', 'External'),
    ('RT-0038', 8, '2024-11-18', '2024-11-23', 'Overdue', 'Research equipment retention', 'External'),
    ('RT-0039', 9, '2024-11-20', '2024-11-25', 'Overdue', 'Training extended unexpectedly', 'External'),
    ('RT-0040', 10, '2024-11-22', '2024-11-27', 'Overdue', 'Production schedule overrun', 'External'),
    ('RT-0041', 1, '2024-11-25', '2024-11-28', 'Returned', 'Quick turnaround rental', 'External'),
    ('RT-0042', 2, '2024-11-26', '2024-11-29', 'Returned', 'EPA spot check completed', 'External'),
    ('RT-0043', 3, '2024-11-26', '2024-12-01', 'Returned', 'Weekend research project', 'External'),
    ('RT-0044', 4, '2024-11-27', '2024-12-02', 'Returned', 'Museum security test', 'External'),
    ('RT-0045', 5, '2024-11-27', '2024-12-03', 'Returned', 'Building re-inspection', 'External'),
    ('RT-0046', 6, '2024-11-28', '2024-12-04', 'Returned', 'Hotel maintenance check', 'External'),
    ('RT-0047', 7, '2024-11-28', '2024-12-05', 'Returned', 'Factory quality assurance', 'External'),
    ('RT-0048', 8, '2024-11-29', '2024-12-06', 'Returned', 'Lab equipment calibration', 'External'),
    ('RT-0049', 9, '2024-11-29', '2024-12-07', 'Returned', 'Drill equipment returned early', 'External'),
    ('RT-0050', 10, '2024-11-30', '2024-12-08', 'Returned', 'Filming wrapped early', 'External'),
    ('RT-0051', 1, '2024-11-28', '2024-12-05', 'CheckedOut', 'Active city investigation', 'External'),
    ('RT-0052', 2, '2024-11-29', '2024-12-06', 'CheckedOut', 'EPA field work in progress', 'External'),
    ('RT-0053', 3, '2024-11-30', '2024-12-07', 'CheckedOut', 'University experiment ongoing', 'External'),
    ('RT-0054', 4, '2024-12-01', '2024-12-08', 'CheckedOut', 'Museum night shift monitoring', 'External'),
    ('RT-0055', 5, '2024-12-02', '2024-12-09', 'CheckedOut', 'Building surveillance active', 'External'),
    ('RT-0056', 6, '2024-12-10', '2024-12-17', 'Reserved', 'Hotel upcoming event reservation', 'External'),
    ('RT-0057', 7, '2024-12-12', '2024-12-19', 'Reserved', 'Factory scheduled inspection', 'External'),
    ('RT-0058', 8, '2024-12-14', '2024-12-21', 'Reserved', 'Winter research program', 'External'),
    ('RT-0059', 9, '2024-12-16', '2024-12-23', 'Reserved', 'Holiday training session', 'External'),
    ('RT-0060', 10, '2024-12-18', '2024-12-25', 'Reserved', 'Year-end production filming', 'External');

-- RT-0001: Mayor Lenny Clotch
INSERT INTO RentedEquipment (RentalId, EquipmentId)
SELECT 
    (SELECT RentalId FROM Rental WHERE RentalCode = 'RT-0001'),
    EquipmentId
FROM Equipment
WHERE EquipmentCode IN ('EQ-PKE-001', 'EQ-TRP-001', 'EQ-PKE-006');

-- RT-0002: EPA
INSERT INTO RentedEquipment (RentalId, EquipmentId)
SELECT 
    (SELECT RentalId FROM Rental WHERE RentalCode = 'RT-0002'),
    EquipmentId
FROM Equipment
WHERE EquipmentCode IN ('EQ-PKE-007', 'EQ-MSC-002');

-- RT-0003: University
INSERT INTO RentedEquipment (RentalId, EquipmentId)
SELECT 
    (SELECT RentalId FROM Rental WHERE RentalCode = 'RT-0003'),
    EquipmentId
FROM Equipment
WHERE EquipmentCode IN ('EQ-PKE-002', 'EQ-PKE-008', 'EQ-MSC-001');

-- RT-0004: Museum
INSERT INTO RentedEquipment (RentalId, EquipmentId)
SELECT 
    (SELECT RentalId FROM Rental WHERE RentalCode = 'RT-0004'),
    EquipmentId
FROM Equipment
WHERE EquipmentCode IN ('EQ-PKE-003', 'EQ-TRP-002', 'EQ-GOG-001');

-- RT-0005: Shandor
INSERT INTO RentedEquipment (RentalId, EquipmentId)
SELECT 
    (SELECT RentalId FROM Rental WHERE RentalCode = 'RT-0005'),
    EquipmentId
FROM Equipment
WHERE EquipmentCode IN ('EQ-PKE-004', 'EQ-TRP-003', 'EQ-PKE-009');

-- RT-0051: Active CheckedOut - Mayor
INSERT INTO RentedEquipment (RentalId, EquipmentId)
SELECT 
    (SELECT RentalId FROM Rental WHERE RentalCode = 'RT-0051'),
    EquipmentId
FROM Equipment
WHERE EquipmentCode IN ('EQ-ECT-001', 'EQ-PKE-005');

-- RT-0052: Active CheckedOut - EPA
INSERT INTO RentedEquipment (RentalId, EquipmentId)
SELECT 
    (SELECT RentalId FROM Rental WHERE RentalCode = 'RT-0052'),
    EquipmentId
FROM Equipment
WHERE EquipmentCode IN ('EQ-SLM-001', 'EQ-GOG-002');

-- RT-0053: Active CheckedOut - University
INSERT INTO RentedEquipment (RentalId, EquipmentId)
SELECT 
    (SELECT RentalId FROM Rental WHERE RentalCode = 'RT-0053'),
    EquipmentId
FROM Equipment
WHERE EquipmentCode IN ('EQ-MSC-003', 'EQ-MSC-004');

-- RT-0054: Active CheckedOut - Museum
INSERT INTO RentedEquipment (RentalId, EquipmentId)
SELECT 
    (SELECT RentalId FROM Rental WHERE RentalCode = 'RT-0054'),
    EquipmentId
FROM Equipment
WHERE EquipmentCode IN ('EQ-LAS-001', 'EQ-BAT-001');

-- RT-0055: Active CheckedOut - Shandor
INSERT INTO RentedEquipment (RentalId, EquipmentId)
SELECT 
    (SELECT RentalId FROM Rental WHERE RentalCode = 'RT-0055'),
    EquipmentId
FROM Equipment
WHERE EquipmentCode IN ('EQ-COM-001', 'EQ-MSC-005');

-- Create maintenance records for equipment with rental history
INSERT INTO Maintenance (
    MaintenanceCode,
    EquipmentId,
    RentalId,
    LastServiceDate,
    MaintenanceStatus,
    OpenedAt,
    ClosedAt,
    Outcome,
    Technician,
    Notes
)
SELECT
-- Generate maintenance code: MT-[TypeCode]-###
    CONCAT('MT-', 
           SUBSTRING_INDEX(SUBSTRING_INDEX(e.EquipmentCode, '-', 2), '-', -1),
           '-',
           LPAD(ROW_NUMBER() OVER (
               PARTITION BY SUBSTRING_INDEX(SUBSTRING_INDEX(e.EquipmentCode, '-', 2), '-', -1)
               ORDER BY e.EquipmentCode
           ), 3, '0')
    ) AS MaintenanceCode,
    
    e.EquipmentId,
    
    -- Get the most recent rental for this equipment
    (SELECT r.RentalId 
     FROM RentedEquipment re
     JOIN Rental r ON r.RentalId = re.RentalId
     WHERE re.EquipmentId = e.EquipmentId
     ORDER BY r.EndDate DESC, r.StartDate DESC
     LIMIT 1
    ) AS RentalId,
    
    -- LastServiceDate
    COALESCE(
        (SELECT DATE_ADD(r.EndDate, INTERVAL 1 DAY)
         FROM RentedEquipment re
         JOIN Rental r ON r.RentalId = re.RentalId
         WHERE re.EquipmentId = e.EquipmentId
         ORDER BY r.EndDate DESC
         LIMIT 1
        ),
        '2024-12-15'
    ) AS LastServiceDate,
    
    -- Status: Open if returned, otherwise Closed
    CASE
        WHEN (SELECT r.RentalStatus 
              FROM RentedEquipment re
              JOIN Rental r ON r.RentalId = re.RentalId
              WHERE re.EquipmentId = e.EquipmentId
              ORDER BY r.EndDate DESC
              LIMIT 1) = 'Returned' THEN 'Open'
        ELSE 'Closed'
    END AS RentalStatus,
    
    -- OpenDate
    COALESCE(
        (SELECT r.EndDate
         FROM RentedEquipment re
         JOIN Rental r ON r.RentalId = re.RentalId
         WHERE re.EquipmentId = e.EquipmentId
         ORDER BY r.EndDate DESC
         LIMIT 1
        ),
        '2024-12-10'
    ) AS OpenedAt,
    
    -- CloseDate: NULL if Open/Returned, otherwise date
    CASE
        WHEN (SELECT r.RentalStatus 
              FROM RentedEquipment re
              JOIN Rental r ON r.RentalId = re.RentalId
              WHERE re.EquipmentId = e.EquipmentId
              ORDER BY r.EndDate DESC
              LIMIT 1) = 'Returned' THEN NULL
        ELSE COALESCE(
            (SELECT DATE_ADD(r.EndDate, INTERVAL 3 DAY)
             FROM RentedEquipment re
             JOIN Rental r ON r.RentalId = re.RentalId
             WHERE re.EquipmentId = e.EquipmentId
             ORDER BY r.EndDate DESC
             LIMIT 1
            ),
            '2024-12-15'
        )
    END AS ClosedAt,
    
    -- Outcome: Damaged if overdue, otherwise Working
    CASE
        WHEN (SELECT r.RentalStatus 
              FROM RentedEquipment re
              JOIN Rental r ON r.RentalId = re.RentalId
              WHERE re.EquipmentId = e.EquipmentId
              ORDER BY r.EndDate DESC
              LIMIT 1) = 'Overdue' THEN 'Damaged'
        ELSE 'Working'
    END AS Outcome,
    
    -- Technician: NULL if Open, otherwise assign one of 5 names
    CASE
        WHEN (SELECT r.RentalStatus 
              FROM RentedEquipment re
              JOIN Rental r ON r.RentalId = re.RentalId
              WHERE re.EquipmentId = e.EquipmentId
              ORDER BY r.EndDate DESC
              LIMIT 1) = 'Returned' THEN NULL
        ELSE ELT(MOD(e.EquipmentId, 5) + 1, 
                 'Alex Carter', 'Priya Nair', 'Miguel Santos', 'Jordan Lee', 'Emma Novak')
    END AS Technician,
    
    -- Notes based on rental status
    CASE
        WHEN (SELECT r.RentalStatus 
              FROM RentedEquipment re
              JOIN Rental r ON r.RentalId = re.RentalId
              WHERE re.EquipmentId = e.EquipmentId
              ORDER BY r.EndDate DESC
              LIMIT 1) = 'Returned' THEN NULL
        WHEN (SELECT r.RentalStatus 
              FROM RentedEquipment re
              JOIN Rental r ON r.RentalId = re.RentalId
              WHERE re.EquipmentId = e.EquipmentId
              ORDER BY r.EndDate DESC
              LIMIT 1) = 'Overdue' THEN 'Inspection complete; equipment marked as damaged from overdue rental.'
        WHEN (SELECT r.RentalStatus 
              FROM RentedEquipment re
              JOIN Rental r ON r.RentalId = re.RentalId
              WHERE re.EquipmentId = e.EquipmentId
              ORDER BY r.EndDate DESC
              LIMIT 1) = 'Closed' THEN 'Routine post-rental check completed; equipment cleared for service.'
        ELSE 'Baseline inspection completed before first deployment.'
    END AS Notes
FROM Equipment e;

-- Select * from Maintenance;

-- Traits for None (ghost_ID 0)
INSERT INTO IdentifyingTrait (GhostID, TraitID) VALUES
(1, 1), -- Strange Cold Spots
(1, 2); -- Flickering Lights

-- Traits for Phantom (ghost_ID 1)
INSERT INTO IdentifyingTrait (GhostID, TraitID) VALUES
(2, 1), -- Strange Cold Spots
(2, 2), -- Flickering Lights
(2, 3), -- Seeing Disappearing Figures
(2, 9); -- Sense of Being Watched

-- Traits for Wraith (ghost_ID 2)
INSERT INTO IdentifyingTrait (GhostID, TraitID) VALUES
(3, 1), -- Strange Cold Spots
(3, 2), -- Flickering Lights
(3, 7); -- Feeling of Intense Dread/Impending Doom

-- Traits for Poltergeist (ghost_ID 3)
INSERT INTO IdentifyingTrait (GhostID, TraitID) VALUES
(4, 1), -- Strange Cold Spots
(4, 2), -- Flickering Lights
(4, 6), -- Floating Objects
(4, 4); -- Doors Slamming On Their Own

-- Traits for Banshee (ghost_ID 4)
INSERT INTO IdentifyingTrait (GhostID, TraitID) VALUES
(5, 1), -- Strange Cold Spots
(5, 2), -- Flickering Lights
(5, 5), -- Disembodied Screaming
(5, 9); -- Sense of Being Watched

-- Traits for Revenant (ghost_ID 5)
INSERT INTO IdentifyingTrait (GhostID, TraitID) VALUES
(6, 1), -- Strange Cold Spots
(6, 2), -- Flickering Lights
(6, 8), -- Physical Attack
(6, 3), -- Seeing Disappearing Figures
(6, 9); -- Sense of Being Watched

