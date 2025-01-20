<?php
// Autoriser les requêtes CORS
header("Access-Control-Allow-Origin: *"); // Remplacez par l'origine exacte si nécessaire
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Méthodes HTTP autorisées
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // En-têtes autorisés
header("Access-Control-Allow-Credentials: true"); // Si vous avez besoin de cookies ou d'authentification

// Gérer les requêtes OPTIONS (préliminaires)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Informations de connexion à la base de données
$servername = 'localhost'; // Nom du service défini dans docker-compose.yml
$username = 'admin';    // MYSQL_USER dans docker-compose.yml
$password = 'admin';// MYSQL_PASSWORD dans docker-compose.yml
$dbname = 'EDUCATION'; // MYSQL_DATABASE dans docker-compose.yml


// Créer une connexion
$conn = new mysqli($servername, $username, $password, $dbname);

// Vérifier la connexion
if ($conn->connect_error) {
    die(json_encode(["error" => "Connexion échouée: " . $conn->connect_error]));
}

// Récupérer les filtres depuis la requête POST
$input = json_decode(file_get_contents('php://input'), true);
$annee = $input['annee'] ?? null;
$region = $input['region'] ?? null;
$academie = $input['academie'] ?? null;
$departement = $input['departement'] ?? null;
$commune = $input['commune'] ?? null;
$denomination = $input['denomination'] ?? null;

// Construire la requête SQL avec des conditions dynamiques
$sql = "SELECT * FROM etablissement WHERE 1=1";
$params = [];
$types = "";

// Ajouter des conditions selon les filtres
if (!empty($annee)) {
    $sql .= " AND rentree_scolaire = ?";
    $params[] = $annee;
    $types .= "s";
}
if (!empty($region)) {
    $sql .= " AND region_academique = ?";
    $params[] = $region;
    $types .= "s";
}
if (!empty($academie)) {
    $sql .= " AND academie = ?";
    $params[] = $academie;
    $types .= "s";
}
if (!empty($departement)) {
    $sql .= " AND departement = ?";
    $params[] = $departement;
    $types .= "s";
}
if (!empty($commune)) {
    $sql .= " AND commune = ?";
    $params[] = $commune;
    $types .= "s";
}
if (!empty($denomination)) {
    $sql .= " AND denomination_principale = ?";
    $params[] = $denomination;
    $types .= "s";
}

// Préparer la requête
$stmt = $conn->prepare($sql);

// Vérifier si la requête a été correctement préparée
if ($stmt === false) {
    die(json_encode(["error" => "Erreur lors de la préparation de la requête : " . $conn->error]));
}

// Lier les paramètres dynamiquement
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

// Exécuter la requête
$stmt->execute();
$result = $stmt->get_result();

// Récupérer les résultats
$data = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

// Fermer la connexion
$stmt->close();
$conn->close();

// Retourner les données en JSON
echo json_encode($data);
?>
