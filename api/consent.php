<?php
/**
 * GDPR Consent API
 * 
 * This file handles server-side storage of user consent preferences
 * in a GDPR-compliant manner.
 */

// Enable CORS for your domain
header("Access-Control-Allow-Origin: https://yourdomain.com");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
function getDbConnection() {
    $host = 'localhost';
    $dbname = 'consent_db';
    $username = 'dbuser';
    $password = 'dbpassword';
    
    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch(PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return null;
    }
}

// Helper function to generate a random consent ID
function generateConsentId() {
    return bin2hex(random_bytes(16));
}

// Store consent preferences
function storeConsent($consentData) {
    $conn = getDbConnection();
    if (!$conn) {
        return ['status' => 'error', 'message' => 'Database connection failed'];
    }
    
    try {
        // Get or create consent ID
        $consentId = isset($consentData['consentId']) ? $consentData['consentId'] : generateConsentId();
        
        // Anonymized IP (store only the first part)
        $ip = $_SERVER['REMOTE_ADDR'];
        $anonymizedIp = preg_replace('/(\d+\.\d+\.\d+)\.\d+/', '$1.0', $ip);
        
        // Prepare data for storage
        $status = $consentData['status'] ?? 'undefined';
        $preferences = json_encode($consentData['preferences'] ?? []);
        $timestamp = date('Y-m-d H:i:s');
        
        // Check if consent ID already exists
        $stmt = $conn->prepare("SELECT id FROM consent_records WHERE consent_id = :consentId");
        $stmt->bindParam(':consentId', $consentId);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            // Update existing record
            $stmt = $conn->prepare("UPDATE consent_records SET 
                status = :status, 
                preferences = :preferences, 
                last_updated = :timestamp 
                WHERE consent_id = :consentId");
            
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':preferences', $preferences);
            $stmt->bindParam(':timestamp', $timestamp);
            $stmt->bindParam(':consentId', $consentId);
            $stmt->execute();
        } else {
            // Insert new record
            $stmt = $conn->prepare("INSERT INTO consent_records 
                (consent_id, anonymized_ip, status, preferences, created_at, last_updated) 
                VALUES (:consentId, :anonymizedIp, :status, :preferences, :timestamp, :timestamp)");
            
            $stmt->bindParam(':consentId', $consentId);
            $stmt->bindParam(':anonymizedIp', $anonymizedIp);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':preferences', $preferences);
            $stmt->bindParam(':timestamp', $timestamp);
            $stmt->execute();
        }
        
        return [
            'status' => 'success', 
            'consentId' => $consentId
        ];
    } catch(PDOException $e) {
        error_log("Consent storage failed: " . $e->getMessage());
        return ['status' => 'error', 'message' => 'Failed to store consent data'];
    }
}

// Handle API requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
        exit;
    }
    
    $result = storeConsent($input);
    echo json_encode($result);
    exit;
}

// Handle GET request to retrieve consent (for demonstration)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['consentId'])) {
    $consentId = $_GET['consentId'];
    $conn = getDbConnection();
    
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
        exit;
    }
    
    try {
        $stmt = $conn->prepare("SELECT status, preferences FROM consent_records WHERE consent_id = :consentId");
        $stmt->bindParam(':consentId', $consentId);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode([
                'status' => 'success',
                'data' => [
                    'status' => $row['status'],
                    'preferences' => json_decode($row['preferences'], true)
                ]
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Consent not found']);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        error_log("Consent retrieval failed: " . $e->getMessage());
        echo json_encode(['status' => 'error', 'message' => 'Failed to retrieve consent data']);
    }
    
    exit;
}

// Default response for unsupported methods
http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
?>