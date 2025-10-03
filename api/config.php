<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function loadEnv($filePath) {
    if (!file_exists($filePath)) {
        return;
    }
    
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        if (!getenv($name)) {
            putenv("$name=$value");
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

loadEnv(__DIR__ . '/../.env');

define('ENCRYPTION_KEY', getenv('ENCRYPTION_KEY') ?: 'default-key-change-in-production');

define('MYSQL_HOST', getenv('MYSQL_HOST'));
define('MYSQL_DATABASE', getenv('MYSQL_DATABASE'));
define('MYSQL_USER', getenv('MYSQL_USER'));
define('MYSQL_PASSWORD', getenv('MYSQL_PASSWORD'));

define('ADMIN_USERNAME', getenv('ADMIN_USERNAME'));
define('ADMIN_PASSWORD_HASH', password_hash(getenv('ADMIN_PASSWORD') ?: '', PASSWORD_BCRYPT));

function getDB() {
    try {
        $dsn = 'mysql:host=' . MYSQL_HOST . ';dbname=' . MYSQL_DATABASE . ';charset=utf8mb4';
        $db = new PDO($dsn, MYSQL_USER, MYSQL_PASSWORD);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $db->exec("CREATE TABLE IF NOT EXISTS letters (
            id INT AUTO_INCREMENT PRIMARY KEY,
            recipient TEXT NOT NULL,
            content TEXT NOT NULL,
            author VARCHAR(255) DEFAULT 'Anonymous',
            date VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        
        $db->exec("CREATE TABLE IF NOT EXISTS moderation_words (
            id INT AUTO_INCREMENT PRIMARY KEY,
            word VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        
        $db->exec("CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(100) DEFAULT 'Admin',
            permissions TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        
        $db->exec("CREATE TABLE IF NOT EXISTS blog_posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            slug VARCHAR(500) NOT NULL UNIQUE,
            content LONGTEXT NOT NULL,
            author_id INT NOT NULL,
            published BOOLEAN DEFAULT FALSE,
            published_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES admins(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        
        initDefaultAdmin($db);
        
        return $db;
    } catch (PDOException $e) {
        error_log('Database connection failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
}

function initDefaultAdmin($db) {
    try {
        $stmt = $db->prepare("SELECT COUNT(*) FROM admins WHERE username = ?");
        $stmt->execute([ADMIN_USERNAME]);
        $count = $stmt->fetchColumn();
        
        if ($count == 0) {
            $permissions = json_encode([
                'manage_letters' => true,
                'manage_moderation' => true,
                'manage_admins' => true,
                'manage_blog' => true
            ]);
            
            $stmt = $db->prepare("INSERT INTO admins (username, password_hash, role, permissions) VALUES (?, ?, 'Owner', ?)");
            $stmt->execute([ADMIN_USERNAME, ADMIN_PASSWORD_HASH, $permissions]);
        }
    } catch (PDOException $e) {
        error_log('Failed to initialize default admin: ' . $e->getMessage());
    }
}

function encrypt($data) {
    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
    $encrypted = openssl_encrypt($data, 'aes-256-cbc', ENCRYPTION_KEY, 0, $iv);
    return base64_encode($encrypted . '::' . $iv);
}

function decrypt($data) {
    list($encrypted_data, $iv) = explode('::', base64_decode($data), 2);
    return openssl_decrypt($encrypted_data, 'aes-256-cbc', ENCRYPTION_KEY, 0, $iv);
}

function verifyAdmin($username = null, $password = null, $db = null) {
    if ($db === null) {
        $db = getDB();
    }
    
    if ($username !== null && $password !== null) {
        $stmt = $db->prepare("SELECT id, password_hash, role, permissions FROM admins WHERE username = ?");
        $stmt->execute([$username]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($admin && password_verify($password, $admin['password_hash'])) {
            return $admin;
        }
        return false;
    }
    
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (strpos($authHeader, 'Bearer ') === 0) {
        $token = substr($authHeader, 7);
        return verifyToken($token, $db);
    }
    
    return false;
}

function generateToken($username, $adminId) {
    $randomBytes = random_bytes(32);
    $timestamp = time();
    $tokenData = json_encode([
        'username' => $username,
        'admin_id' => $adminId,
        'random' => bin2hex($randomBytes),
        'exp' => $timestamp + 86400
    ]);
    $signature = hash_hmac('sha256', $tokenData, ENCRYPTION_KEY);
    return base64_encode($tokenData . '.' . $signature);
}

function verifyToken($token, $db = null) {
    try {
        if ($db === null) {
            $db = getDB();
        }
        
        $decoded = base64_decode($token);
        $parts = explode('.', $decoded, 2);
        if (count($parts) !== 2) {
            return false;
        }
        
        list($tokenData, $signature) = $parts;
        $expectedSignature = hash_hmac('sha256', $tokenData, ENCRYPTION_KEY);
        
        if (!hash_equals($expectedSignature, $signature)) {
            return false;
        }
        
        $data = json_decode($tokenData, true);
        if (!$data || !isset($data['username']) || !isset($data['exp']) || !isset($data['admin_id'])) {
            return false;
        }
        
        if (time() > $data['exp']) {
            return false;
        }
        
        $stmt = $db->prepare("SELECT id, username, role, permissions FROM admins WHERE id = ? AND username = ?");
        $stmt->execute([$data['admin_id'], $data['username']]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $admin ? $admin : false;
    } catch (Exception $e) {
        return false;
    }
}

function containsModeratedWords($text, $db) {
    $stmt = $db->query("SELECT word FROM moderation_words");
    $words = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $textLower = strtolower($text);
    foreach ($words as $word) {
        if (stripos($textLower, strtolower($word)) !== false) {
            return true;
        }
    }
    
    return false;
}
?>