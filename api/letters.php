<?php
require_once 'config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $db->query("SELECT id, recipient, content, author, date FROM letters ORDER BY created_at DESC");
            $letters = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $decryptedLetters = array_map(function($letter) {
                return [
                    'id' => $letter['id'],
                    'to' => decrypt($letter['recipient']),
                    'content' => decrypt($letter['content']),
                    'author' => $letter['author'],
                    'date' => $letter['date']
                ];
            }, $letters);
            
            echo json_encode($decryptedLetters);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to retrieve letters']);
        }
        break;
        
    case 'POST':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['to']) || !isset($data['content'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                exit();
            }
            
            if (containsModeratedWords($data['content'], $db) || containsModeratedWords($data['to'], $db)) {
                http_response_code(400);
                echo json_encode(['error' => 'Your letter contains moderated content']);
                exit();
            }
            
            $encryptedRecipient = encrypt($data['to']);
            $encryptedContent = encrypt($data['content']);
            $author = $data['author'] ?? 'Anonymous';
            $date = $data['date'] ?? date('c');
            
            $stmt = $db->prepare("INSERT INTO letters (recipient, content, author, date) VALUES (?, ?, ?, ?)");
            $stmt->execute([$encryptedRecipient, $encryptedContent, $author, $date]);
            
            $letterId = $db->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'id' => $letterId,
                'message' => 'Letter submitted successfully'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to submit letter']);
        }
        break;
        
    case 'DELETE':
        if (!verifyAdmin()) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit();
        }
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing letter ID']);
                exit();
            }
            
            $stmt = $db->prepare("DELETE FROM letters WHERE id = ?");
            $stmt->execute([$data['id']]);
            
            echo json_encode(['success' => true, 'message' => 'Letter deleted successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete letter']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>