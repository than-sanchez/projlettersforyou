<?php
require_once 'config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $admin = verifyAdmin();
        if (!$admin) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit();
        }
        
        $permissions = json_decode($admin['permissions'], true);
        if (!isset($permissions['manage_admins']) || !$permissions['manage_admins']) {
            http_response_code(403);
            echo json_encode(['error' => 'Insufficient permissions']);
            exit();
        }
        
        try {
            $stmt = $db->query("SELECT id, username, role, permissions, created_at, updated_at FROM admins ORDER BY created_at DESC");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $usersWithParsedPermissions = array_map(function($user) {
                $user['permissions'] = json_decode($user['permissions'], true);
                return $user;
            }, $users);
            
            echo json_encode($usersWithParsedPermissions);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to retrieve admin users']);
        }
        break;
        
    case 'POST':
        $admin = verifyAdmin();
        if (!$admin) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit();
        }
        
        $permissions = json_decode($admin['permissions'], true);
        if (!isset($permissions['manage_admins']) || !$permissions['manage_admins']) {
            http_response_code(403);
            echo json_encode(['error' => 'Insufficient permissions']);
            exit();
        }
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['username']) || !isset($data['password'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Username and password are required']);
                exit();
            }
            
            $username = $data['username'];
            $password = $data['password'];
            $role = $data['role'] ?? 'Admin';
            $userPermissions = isset($data['permissions']) ? json_encode($data['permissions']) : json_encode([
                'manage_letters' => false,
                'manage_moderation' => false,
                'manage_admins' => false,
                'manage_blog' => false
            ]);
            
            $passwordHash = password_hash($password, PASSWORD_BCRYPT);
            
            $stmt = $db->prepare("INSERT INTO admins (username, password_hash, role, permissions) VALUES (?, ?, ?, ?)");
            $stmt->execute([$username, $passwordHash, $role, $userPermissions]);
            
            $newUserId = $db->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'id' => $newUserId,
                'message' => 'Admin user created successfully'
            ]);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                http_response_code(400);
                echo json_encode(['error' => 'Username already exists']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create admin user']);
            }
        }
        break;
        
    case 'PUT':
        $admin = verifyAdmin();
        if (!$admin) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit();
        }
        
        $permissions = json_decode($admin['permissions'], true);
        if (!isset($permissions['manage_admins']) || !$permissions['manage_admins']) {
            http_response_code(403);
            echo json_encode(['error' => 'Insufficient permissions']);
            exit();
        }
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'User ID is required']);
                exit();
            }
            
            $userId = $data['id'];
            
            $updateFields = [];
            $params = [];
            
            if (isset($data['username'])) {
                $updateFields[] = "username = ?";
                $params[] = $data['username'];
            }
            
            if (isset($data['password'])) {
                $updateFields[] = "password_hash = ?";
                $params[] = password_hash($data['password'], PASSWORD_BCRYPT);
            }
            
            if (isset($data['role'])) {
                $updateFields[] = "role = ?";
                $params[] = $data['role'];
            }
            
            if (isset($data['permissions'])) {
                $updateFields[] = "permissions = ?";
                $params[] = json_encode($data['permissions']);
            }
            
            if (empty($updateFields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No fields to update']);
                exit();
            }
            
            $params[] = $userId;
            
            $sql = "UPDATE admins SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Admin user not found']);
                exit();
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Admin user updated successfully'
            ]);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                http_response_code(400);
                echo json_encode(['error' => 'Username already exists']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update admin user']);
            }
        }
        break;
        
    case 'DELETE':
        $admin = verifyAdmin();
        if (!$admin) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit();
        }
        
        $permissions = json_decode($admin['permissions'], true);
        if (!isset($permissions['manage_admins']) || !$permissions['manage_admins']) {
            http_response_code(403);
            echo json_encode(['error' => 'Insufficient permissions']);
            exit();
        }
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'User ID is required']);
                exit();
            }
            
            $userId = $data['id'];
            
            if ($userId == $admin['id']) {
                http_response_code(400);
                echo json_encode(['error' => 'Cannot delete your own account']);
                exit();
            }
            
            $stmt = $db->prepare("DELETE FROM admins WHERE id = ?");
            $stmt->execute([$userId]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Admin user not found']);
                exit();
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Admin user deleted successfully'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete admin user']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
