<?php
require_once 'config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

function generateSlug($title) {
    $slug = strtolower(trim($title));
    $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    $slug = trim($slug, '-');
    return $slug;
}

function ensureUniqueSlug($slug, $db, $excludeId = null) {
    $originalSlug = $slug;
    $counter = 1;
    
    while (true) {
        $sql = "SELECT COUNT(*) FROM blog_posts WHERE slug = ?";
        $params = [$slug];
        
        if ($excludeId !== null) {
            $sql .= " AND id != ?";
            $params[] = $excludeId;
        }
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $count = $stmt->fetchColumn();
        
        if ($count == 0) {
            return $slug;
        }
        
        $slug = $originalSlug . '-' . $counter;
        $counter++;
    }
}

function getBlogPostWithAuthor($blogPost, $db) {
    $stmt = $db->prepare("SELECT id, username, role FROM admins WHERE id = ?");
    $stmt->execute([$blogPost['author_id']]);
    $author = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $blogPost['author_name'] = $author ? $author['username'] : 'Unknown';
    
    return $blogPost;
}

switch ($method) {
    case 'GET':
        try {
            $id = $_GET['id'] ?? null;
            $slug = $_GET['slug'] ?? null;
            
            $admin = verifyAdmin();
            $isAdmin = $admin !== false;
            
            if ($id !== null) {
                if ($isAdmin) {
                    $stmt = $db->prepare("SELECT * FROM blog_posts WHERE id = ?");
                } else {
                    $stmt = $db->prepare("SELECT * FROM blog_posts WHERE id = ? AND published = 1");
                }
                $stmt->execute([$id]);
                $post = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$post) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Blog post not found']);
                    exit();
                }
                
                $post = getBlogPostWithAuthor($post, $db);
                echo json_encode($post);
            } elseif ($slug !== null) {
                if ($isAdmin) {
                    $stmt = $db->prepare("SELECT * FROM blog_posts WHERE slug = ?");
                } else {
                    $stmt = $db->prepare("SELECT * FROM blog_posts WHERE slug = ? AND published = 1");
                }
                $stmt->execute([$slug]);
                $post = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$post) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Blog post not found']);
                    exit();
                }
                
                $post = getBlogPostWithAuthor($post, $db);
                echo json_encode($post);
            } else {
                if ($isAdmin) {
                    $stmt = $db->query("SELECT * FROM blog_posts ORDER BY created_at DESC");
                } else {
                    $stmt = $db->query("SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC");
                }
                $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $postsWithAuthors = array_map(function($post) use ($db) {
                    return getBlogPostWithAuthor($post, $db);
                }, $posts);
                
                echo json_encode($postsWithAuthors);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to retrieve blog posts']);
        }
        break;
        
    case 'POST':
        $admin = verifyAdmin();
        if (!$admin) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit();
        }
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['title']) || !isset($data['content'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Title and content are required']);
                exit();
            }
            
            $title = $data['title'];
            $content = $data['content'];
            $published = isset($data['published']) ? (bool)$data['published'] : false;
            $authorId = $admin['id'];
            
            $slug = generateSlug($title);
            $slug = ensureUniqueSlug($slug, $db);
            
            $publishedAt = $published ? date('Y-m-d H:i:s') : null;
            
            $stmt = $db->prepare("INSERT INTO blog_posts (title, slug, content, author_id, published, published_at) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $slug, $content, $authorId, $published, $publishedAt]);
            
            $postId = $db->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'id' => $postId,
                'slug' => $slug,
                'message' => 'Blog post created successfully'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create blog post']);
        }
        break;
        
    case 'PUT':
        $admin = verifyAdmin();
        if (!$admin) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit();
        }
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Post ID is required']);
                exit();
            }
            
            $postId = $data['id'];
            
            $stmt = $db->prepare("SELECT * FROM blog_posts WHERE id = ?");
            $stmt->execute([$postId]);
            $existingPost = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$existingPost) {
                http_response_code(404);
                echo json_encode(['error' => 'Blog post not found']);
                exit();
            }
            
            $updateFields = [];
            $params = [];
            
            if (isset($data['title'])) {
                $updateFields[] = "title = ?";
                $params[] = $data['title'];
                
                $newSlug = generateSlug($data['title']);
                $newSlug = ensureUniqueSlug($newSlug, $db, $postId);
                $updateFields[] = "slug = ?";
                $params[] = $newSlug;
            }
            
            if (isset($data['content'])) {
                $updateFields[] = "content = ?";
                $params[] = $data['content'];
            }
            
            if (isset($data['published'])) {
                $published = (bool)$data['published'];
                $updateFields[] = "published = ?";
                $params[] = $published;
                
                if ($published && !$existingPost['published']) {
                    $updateFields[] = "published_at = ?";
                    $params[] = date('Y-m-d H:i:s');
                } elseif (!$published) {
                    $updateFields[] = "published_at = ?";
                    $params[] = null;
                }
            }
            
            if (empty($updateFields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No fields to update']);
                exit();
            }
            
            $params[] = $postId;
            
            $sql = "UPDATE blog_posts SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode([
                'success' => true,
                'message' => 'Blog post updated successfully'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update blog post']);
        }
        break;
        
    case 'DELETE':
        $admin = verifyAdmin();
        if (!$admin) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit();
        }
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Post ID is required']);
                exit();
            }
            
            $postId = $data['id'];
            
            $stmt = $db->prepare("DELETE FROM blog_posts WHERE id = ?");
            $stmt->execute([$postId]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Blog post not found']);
                exit();
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Blog post deleted successfully'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete blog post']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
