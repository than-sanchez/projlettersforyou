<?php
require_once 'config.php';

if (!verifyAdmin()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $db->query("SELECT id, word FROM moderation_words ORDER BY word ASC");
            $words = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($words);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to retrieve moderation words']);
        }
        break;
        
    case 'POST':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['word']) || empty(trim($data['word']))) {
                http_response_code(400);
                echo json_encode(['error' => 'Word is required']);
                exit();
            }
            
            $word = trim($data['word']);
            
            $stmt = $db->prepare("INSERT INTO moderation_words (word) VALUES (?)");
            $stmt->execute([$word]);
            
            echo json_encode([
                'success' => true,
                'id' => $db->lastInsertId(),
                'message' => 'Moderation word added successfully'
            ]);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                http_response_code(400);
                echo json_encode(['error' => 'Word already exists']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to add moderation word']);
            }
        }
        break;
        
    case 'DELETE':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Word ID is required']);
                exit();
            }
            
            $stmt = $db->prepare("DELETE FROM moderation_words WHERE id = ?");
            $stmt->execute([$data['id']]);
            
            echo json_encode(['success' => true, 'message' => 'Moderation word deleted successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete moderation word']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>