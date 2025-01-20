<?php
// Envoyer les données en JSON
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

// Informations de connexion à la base de données
$servername = 'localhost'; // Nom du service défini dans docker-compose.yml
$username = 'admin';    // MYSQL_USER dans docker-compose.yml
$password = 'admin';// MYSQL_PASSWORD dans docker-compose.yml
$dbname = 'EDUCATION'; // MYSQL_DATABASE dans docker-compose.yml
 

// Créer une connexion
$conn = new mysqli($servername, $username, $password, $dbname);

// Vérifier la connexion
if ($conn->connect_error) {
    die("Connexion échouée: " . $conn->connect_error);
}

// Initialiser un tableau pour chaque colonne
$data = [
    'rentree_scolaire' => [],
    'region_academique' => [],
    'academie' => [],
    'departement' => [],
    'commune' => [],
    'denomination_principale' => []
];

// Construire la requête SQL
$sql = "SELECT DISTINCT rentree_scolaire, region_academique, academie, departement, commune, denomination_principale FROM etablissement";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Ajouter chaque valeur à son tableau respectif si elle n'y est pas déjà
        foreach ($row as $key => $value) {
            if (!in_array($value, $data[$key])) {
                $data[$key][] = $value;
            }
        }
    }
} else {
    echo json_encode(["message" => "Aucun résultat trouvé."]);
    exit;
}

// Fermer la connexion
$conn->close();

// Retourner les données en JSON
echo json_encode($data);
?>
