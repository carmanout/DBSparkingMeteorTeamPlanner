// Declaration of the characters array
let characters = [];

// Variables for filters
let searchTerm = '';
let dpFilter = 10; // Default DP is 10
let dpFilterEnabled = true; // DP filter is enabled by default

// Function to load characters from the JSON file
function loadCharacters() {
    fetch('js/characters.json') // Ensure the path is correct
        .then(response => {
            if (!response.ok) {
                throw new Error('Error loading characters.json file');
            }
            return response.json();
        })
        .then(data => {
            characters = data;
            displayCharacters(); // Call the function to display characters
        })
        .catch(error => console.error('Error loading characters:', error));
}

// Function to display characters in the picker
function displayCharacters() {
    const picker = document.getElementById('character-picker');
    picker.innerHTML = ''; // Clear the picker

    // Filter characters based on search term and DP filter
    const filteredCharacters = characters.filter(character => {
        const nameMatches = character.name.toLowerCase().includes(searchTerm.toLowerCase());
        const dpValue = character.dp;
        const dpIsValid = dpValue !== null && !isNaN(dpValue);
        let dpMatches = true;

        if (dpFilterEnabled) {
            dpMatches = dpIsValid && dpValue === dpFilter;
        }

        return nameMatches && dpMatches;
    });

    filteredCharacters.forEach(character => {
        const card = document.createElement('div');
        card.className = 'card card-team'; // Use the same class as team cards
        card.dataset.id = character.id;
        card.dataset.name = character.name
        card.innerHTML = `
            <img src="${character.image}" loading="lazy" class="card-img-top" alt="${character.name}">
            <div class="card-body">
                <h5 class="card-title">${character.name}</h5>
                <p class="card-text">DP: ${character.dp !== null ? character.dp : 'N/A'}</p>
                <button class="btn btn-primary btn-sm btn-info-character"><i class="bi bi-info-circle"></i></button>
            </div>
        `;
        picker.appendChild(card);

        // Event to add the character to the team or view details
        card.addEventListener('click', function (e) {
            if (e.target.closest('.btn-info-character')) {
                e.stopPropagation();
                viewDetails(character.name);
            } else {
                addCharacterToTeam(character.name);
            }
        });
    });

    // Update the visual selection of characters if there is an active team
    if (currentTeam) {
        updateCharacterSelection();
    }
}

// Function to view details in the modal
function viewDetails(id) {
    const character = characters.find(c => c.id === id);
    if (character) {
        document.getElementById('modal-character-name').textContent = character.name;
        const details = character.details;
        const modalBody = document.getElementById('modal-character-body');
        modalBody.innerHTML = `
            <p><strong>Special Attacks:</strong> ${details.attacks.join(', ')}</p>
            <p><strong>Actions:</strong> ${details.actions.join(', ')}</p>
            <p><strong>Health Bars:</strong> ${details.health !== null ? details.health : 'N/A'}</p>
            <p><strong>Strength:</strong> ${details.strength !== null ? details.strength : 'N/A'}</p>
            <p><strong>Defense:</strong> ${details.defense !== null ? details.defense : 'N/A'}</p>
            <p><strong>Speed:</strong> ${details.speed !== null ? details.speed : 'N/A'}</p>
            <p><strong>Ki:</strong> ${details.ki !== null ? details.ki : 'N/A'}</p>
        `;

        // Set the background image of the modal
        const modalContent = document.querySelector('.modal-character-content');
        modalContent.style.backgroundImage = `url('${character.image}')`;

        $('#modal-character').modal('show');
    }
}

// Expose the function viewDetails and updateCharacterSelection to the global scope
window.viewDetails = viewDetails;
window.updateCharacterSelection = updateCharacterSelection;

// Event listeners added when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
    loadCharacters();

    const arrowLeft = document.getElementById('arrow-left');
    const arrowRight = document.getElementById('arrow-right');

    arrowLeft.addEventListener('click', scrollLeft);
    arrowRight.addEventListener('click', scrollRight);

    // Event for the search bar
    document.getElementById('search').addEventListener('input', function () {
        searchTerm = this.value;
        displayCharacters();
    });

    // Event for the DP filter slider
    document.getElementById('dp-range').addEventListener('input', function () {
        dpFilter = parseInt(this.value);
        document.getElementById('dp-range-value').textContent = dpFilter;
        displayCharacters();
    });

    // Event for the DP filter toggle button
    document.getElementById('dp-filter-toggle').addEventListener('change', function () {
        dpFilterEnabled = this.checked;
        displayCharacters();
    });
});

// Function to scroll the picker to the left
function scrollLeft() {
    const picker = document.getElementById('character-picker');
    picker.scrollBy({
        left: -200,
        behavior: 'smooth'
    });
}

// Function to scroll the picker to the right
function scrollRight() {
    const picker = document.getElementById('character-picker');
    picker.scrollBy({
        left: 200,
        behavior: 'smooth'
    });
}

function updateCharacterSelection() {
    document.querySelectorAll('.card-character, .card-team').forEach(card => {
        const id = parseInt(card.dataset.id);
        const name = card.dataset.name;
        const character = characters.find(c => c.id === id);

        if (!character) {
            console.warn(`Personaje con id "${id}" no encontrado en el array de personajes.`);
            return; // Salta a la siguiente tarjeta si no se encuentra el personaje
        }

        const canDuplicate = character.canDuplicate;
        const quantityInTeam = currentTeam.characters.filter(c => c.id === id).length;

        // Obtiene el valor de DP del personaje y verifica su validez
        const dpValue = character.dp;
        const dpIsValid = dpValue !== null && !isNaN(dpValue);
        const totalDPAfterAddition = dpIsValid ? currentTeam.dpTotal + dpValue : currentTeam.dpTotal;

        // Modificación: Verifica que el nombre coincida antes de aplicar las condiciones
        const notSelectable = (
            (character.name === name) && (
                (!canDuplicate && quantityInTeam > 0) ||
                (currentTeam.characters.length >= 5) ||
                (dpIsValid && totalDPAfterAddition > 15)
            )
        );

        // if (notSelectable) {
        //     card.classList.add('not-selectable');
        // } else {
        //     card.classList.remove('not-selectable');
        // }

        // Indicador de personaje ya seleccionado
        if (quantityInTeam > 0 && !canDuplicate) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}
