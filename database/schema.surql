-- Lighthouse Log Collector Schema
-- SurrealDB Schema Definition

-- Define Namespace and Database
DEFINE NAMESPACE lighthouse;
USE NS lighthouse;
DEFINE DATABASE logs;
USE DB logs;

-- Users Table
DEFINE TABLE users SCHEMAFULL;
DEFINE FIELD email ON users TYPE string;
DEFINE FIELD password_hash ON users TYPE string;
DEFINE FIELD created_at ON users TYPE datetime;
DEFINE INDEX unique_email ON users FIELDS email UNIQUE;

-- Projects Table
DEFINE TABLE projects SCHEMAFULL;
DEFINE FIELD name ON projects TYPE string;
DEFINE FIELD owner_id ON projects TYPE string;
DEFINE FIELD created_at ON projects TYPE datetime;

-- API Keys Table
DEFINE TABLE api_keys SCHEMAFULL;
DEFINE FIELD key ON api_keys TYPE string;
DEFINE FIELD project_id ON api_keys TYPE string;
DEFINE FIELD active ON api_keys TYPE bool;
DEFINE FIELD created_at ON api_keys TYPE datetime;
DEFINE INDEX unique_key ON api_keys FIELDS key UNIQUE;

-- Logs Table
DEFINE TABLE logs SCHEMAFULL;
DEFINE FIELD level ON logs TYPE string;
DEFINE FIELD message ON logs TYPE string;
DEFINE FIELD timestamp ON logs TYPE datetime;
DEFINE FIELD source ON logs TYPE string;
DEFINE FIELD metadata ON logs TYPE object;
DEFINE FIELD project_id ON logs TYPE string;
DEFINE INDEX idx_project_timestamp ON logs FIELDS project_id, timestamp;
DEFINE INDEX idx_level ON logs FIELDS level;
