import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faCalendarAlt,
  faMapMarkerAlt,
  faBuilding,
  faUniversity,
  faCity,
  faSchool,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
  const [etablissements, setEtablissements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // États pour stocker les options des filtres
  const [anneesScolaires, setAnneesScolaires] = useState([]);
  const [regions, setRegions] = useState([]);
  const [academies, setAcademies] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [denominations, setDenominations] = useState([]);

  // États pour les valeurs sélectionnées
  const [anneeFiltre, setAnneeFiltre] = useState('');
  const [regionFiltre, setRegionFiltre] = useState('');
  const [academieFiltre, setAcademieFiltre] = useState('');
  const [departementFiltre, setDepartementFiltre] = useState('');
  const [communeFiltre, setCommuneFiltre] = useState('');
  const [denominationFiltre, setDenominationFiltre] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Charger les options des filtres au montage
  useEffect(() => {
    const fetchFiltres = async () => {
      try {
        const response = await fetch('http://localhost/DEVOPS-API/All-filter-data.php');
        if (!response.ok) {
          throw new Error(`Erreur API : ${response.status}`);
        }
        const data = await response.json();

        // Mettre à jour les options des filtres
        setAnneesScolaires(data['rentree_scolaire'] || []);
        setRegions(data['region_academique'] || []);
        setAcademies(data['academie'] || []);
        setDepartements(data['departement'] || []);
        setCommunes(data['commune'] || []);
        setDenominations(data['denomination_principale'] || []);
      } catch (error) {
        setError('Erreur lors du chargement des filtres. Veuillez réessayer.');
      }
    };

    fetchFiltres();
  }, []);

  // Bouton Rechercher : envoyer les filtres à l'API
  const handleRechercher = async () => {
    setIsLoading(true);
    setError(null);

    const params = {
      annee: anneeFiltre,
      region: regionFiltre,
      academie: academieFiltre,
      departement: departementFiltre,
      commune: communeFiltre,
      denomination: denominationFiltre,
    };

    try {
      const response = await fetch('http://localhost/DEVOPS-API/search.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Erreur API : ${response.status}`);
      }

      const data = await response.json();
      setEtablissements(data);
      setCurrentPage(1); // Reset pagination to the first page
    } catch (error) {
      setError('Une erreur est survenue lors de la recherche. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination logic with ellipsis
  const totalPages = Math.ceil(etablissements.length / itemsPerPage);
  const getPaginationItems = () => {
    const pages = [];
    const maxPages = 10;

    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 3);
      let end = Math.min(totalPages - 1, currentPage + 3);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (page) => {
    if (page !== '...') {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container">
      <div className="navbar">
        <h1>Statistiques Étudiants</h1>
        <div className="filtres">
          {[
            {
              label: 'Rentrée scolaire',
              icon: faCalendarAlt,
              value: anneeFiltre,
              setter: setAnneeFiltre,
              options: anneesScolaires,
            },
            {
              label: 'Région académique',
              icon: faMapMarkerAlt,
              value: regionFiltre,
              setter: setRegionFiltre,
              options: regions,
            },
            {
              label: 'Académie',
              icon: faUniversity,
              value: academieFiltre,
              setter: setAcademieFiltre,
              options: academies,
            },
            {
              label: 'Département',
              icon: faBuilding,
              value: departementFiltre,
              setter: setDepartementFiltre,
              options: departements,
            },
            {
              label: 'Commune',
              icon: faCity,
              value: communeFiltre,
              setter: setCommuneFiltre,
              options: communes,
            },
            {
              label: 'Dénomination principale',
              icon: faSchool,
              value: denominationFiltre,
              setter: setDenominationFiltre,
              options: denominations,
            },
          ].map((filtre, index) => (
            <div key={index} className="filtre-groupe">
              <label>
                <FontAwesomeIcon icon={filtre.icon} /> {filtre.label} :
              </label>
              <input
                list={`${filtre.label}-options`}
                value={filtre.value}
                onChange={(e) => filtre.setter(e.target.value)}
                placeholder={`Choisir ${filtre.label.toLowerCase()}`}
              />
              <datalist id={`${filtre.label}-options`}>
                {filtre.options.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
          ))}
        </div>

        <button className="btn-rechercher" onClick={handleRechercher}>
          <FontAwesomeIcon icon={faSearch} /> Rechercher
        </button>
      </div>

      {isLoading && (
        <div className="loading">
          <FontAwesomeIcon icon={faSpinner} spin />
          Chargement en cours...
        </div>
      )}

      {error && (
        <div className="error">
          <h2>Erreur :</h2>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="table-container">
          {etablissements.length === 0 ? (
            <div className="no-results">Aucune information trouvée.</div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Rentrée scolaire</th>
                    <th>Région académique</th>
                    <th>Académie</th>
                    <th>Département</th>
                    <th>Commune</th>
                    <th>Dénomination principale</th>
                    <th className="highlight-th">Nombre d'élèves</th>
                    <th className="highlight-th">Nombre d'élèves en Terminale</th>
                    <th className="highlight-th">Filles en Terminale</th>
                    <th className="highlight-th">Garçons en Terminale</th>
                  </tr>
                </thead>
                <tbody>
                  {etablissements
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage
                    )
                    .map((etab) => (
                      <tr key={etab.id}>
                        <td>{etab.rentree_scolaire}</td>
                        <td>{etab.region_academique}</td>
                        <td>{etab.academie}</td>
                        <td>{etab.departement}</td>
                        <td>{etab.commune}</td>
                        <td>{etab.denomination_principale}</td>
                        <td className="highlight-td">{etab.nombre_eleves}</td>
                        <td className="highlight-td">{etab.nombre_eleves_terminal}</td>
                        <td className="highlight-td">{etab.nombre_eleves_terminal_filles}</td>
                        <td className="highlight-td">{etab.nombre_eleves_terminal_garcons}</td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <div className="pagination">
                {getPaginationItems().map((page, index) => (
                  <button
                    key={index}
                    className={currentPage === page ? 'active' : ''}
                    onClick={() => handlePageChange(page)}
                    disabled={page === '...'}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;