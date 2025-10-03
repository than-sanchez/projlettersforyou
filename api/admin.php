<?php
require_once 'config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['action']) && $data['action'] === 'login') {
            $username = $data['username'] ?? '';
            $password = $data['password'] ?? '';
            
            $admin = verifyAdmin($username, $password, $db);
            if ($admin) {
                $token = generateToken($admin['username'], $admin['id']);
                echo json_encode([
                    'success' => true,
                    'token' => $token,
                    'username' => $admin['username'],
                    'role' => $admin['role'],
                    'permissions' => json_decode($admin['permissions'], true),
                    'message' => 'Login successful'
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid username or password']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>