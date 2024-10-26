let teams = JSON.parse(localStorage.getItem('teams')) || [];
let currentTeam = null;

// Variable to store the name of the team to be deleted
let teamToDelete = null;

// Function to load saved teams
function loadTeams() {
    const teamsContainer = document.getElementById('saved-teams');
    teamsContainer.innerHTML = '';
    if (teams.length === 0) {
        teamsContainer.innerHTML = '<p>No saved teams.</p>';
    } else {
        teams.forEach(team => {
            const teamDiv = document.createElement('div');
            teamDiv.className = 'alert alert-secondary d-flex justify-content-between align-items-center';
            teamDiv.innerHTML = `
                <span>${team.name}</span>
                <div>
                    <button class="btn btn-primary btn-sm mr-2" onclick="editTeam('${team.name}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="confirmDeleteTeam('${team.name}')">Delete</button>
                </div>
            `;
            teamsContainer.appendChild(teamDiv);
        });
    }
}

// Function to create a new team
function createTeam() {
    $('#modal-team-name').modal('show');
}

// Handle the submit event of the team name modal form
document.getElementById('form-team-name').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('input-team-name').value.trim();
    if (name) {
        if (teams.some(t => t.name === name)) {
            showMessage('A team with that name already exists.');
        } else {
            currentTeam = {
                name: name,
                characters: [],
                dpTotal: 0
            };
            teams.push(currentTeam);
            saveTeams();
            $('#modal-team-name').modal('hide');
            document.getElementById('input-team-name').value = '';
            showTeamManagement();
        }
    } else {
        showMessage('The team name cannot be empty.');
    }
});

// Function to confirm team deletion
function confirmDeleteTeam(name) {
    teamToDelete = name;
    document.getElementById('modal-confirm-body').textContent = `Are you sure you want to delete the team "${name}"?`;
    $('#modal-confirm').modal('show');
}

// Handle the confirmation of deletion
document.getElementById('btn-confirm-action').addEventListener('click', function() {
    if (teamToDelete) {
        deleteTeam(teamToDelete);
        teamToDelete = null;
        $('#modal-confirm').modal('hide');
    }
});

// Function to edit an existing team
function editTeam(name) {
    currentTeam = teams.find(t => t.name === name);
    if (currentTeam) {
        showTeamManagement();
        updateTeamUI();
        updateCharacterSelection(); // Update character selection
    }
}

// Function to delete a team
function deleteTeam(name) {
    teams = teams.filter(t => t.name !== name);
    saveTeams();
    loadTeams();
}

// Function to add a character to the team
function addCharacterToTeam(characterName) {
    if (!currentTeam) return;

    const character = characters.find(c => c.name === characterName);
    const canDuplicate = character.canDuplicate;
    const quantityInTeam = currentTeam.characters.filter(c => c.name === characterName).length;

    if (!canDuplicate && quantityInTeam > 0) {
        showMessage('This character cannot be added more than once.');
        return;
    }
    if (currentTeam.characters.length >= 5) {
        showMessage('The team already has 5 characters.');
        return;
    }
    if (character.dp !== null && !isNaN(character.dp)) {
        if (currentTeam.dpTotal + character.dp > 15) {
            showMessage('You cannot exceed 15 DP.');
            return;
        }
    }
    currentTeam.characters.push(character);
    if (character.dp !== null && !isNaN(character.dp)) {
        currentTeam.dpTotal += character.dp;
    }
    saveTeams();
    updateTeamUI();
    updateCharacterSelection(); // Update character selection
}

// Function to remove a character from the team
function removeCharacterFromTeam(characterId) {
    if (!currentTeam) return;

    const index = currentTeam.characters.findIndex(c => c.id === characterId);
    if (index !== -1) {
        const character = currentTeam.characters[index];
        if (character.dp !== null && !isNaN(character.dp)) {
            currentTeam.dpTotal -= character.dp;
        }
        currentTeam.characters.splice(index, 1);
        saveTeams();
        updateTeamUI();
        updateCharacterSelection(); // Update character selection
    }
}

// Function to show messages in a custom modal
function showMessage(message) {
    document.getElementById('modal-message-body').textContent = message;
    $('#modal-message').modal('show');
    hideModalTimeout = setTimeout(() => {
        $('#modal-message').modal('hide');
    }, 3000);

}

// Function to save teams to localStorage
function saveTeams() {
    localStorage.setItem('teams', JSON.stringify(teams));
}

// Function to show the team management section
function showTeamManagement() {
    document.getElementById('start-menu').classList.add('d-none');
    document.getElementById('team-management').classList.remove('d-none');
    document.getElementById('team-name').textContent = currentTeam.name;
    updateTeamUI();
    updateCharacterSelection(); // Update character selection
}

// Function to return to the start menu
function backToMenu() {
    currentTeam = null;
    document.getElementById('team-management').classList.add('d-none');
    document.getElementById('start-menu').classList.remove('d-none');
    loadTeams();
    displayCharacters(); // Reset character selection
}

// Function to update the UI of the current team
function updateTeamUI() {
    const teamContainer = document.getElementById('my-team');
    teamContainer.innerHTML = '';

    // Update the total DP in the UI
    const dpCurrentElement = document.getElementById('dp-current');
    dpCurrentElement.textContent = currentTeam.dpTotal;

    // Remove previous classes for DP color
    dpCurrentElement.classList.remove('dp-normal', 'dp-warning', 'dp-limit');

    // Add the appropriate class based on the current DP
    if (currentTeam.dpTotal >= 15) {
        dpCurrentElement.classList.add('dp-limit');
    } else if (currentTeam.dpTotal >= 12) {
        dpCurrentElement.classList.add('dp-warning');
    } else {
        dpCurrentElement.classList.add('dp-normal');
    }

    if (currentTeam.characters.length === 0) {
        teamContainer.innerHTML = '<p>No characters in the team.</p>';
    } else {
        currentTeam.characters.forEach(character => {
            const card = document.createElement('div');
            card.className = 'card card-team-selected';
            card.dataset.id = character.id;
            card.innerHTML = `
                <img src="${character.image}" loading="lazy" class="card-img-top" alt="${character.name}">
                <div class="card-body">
                    <h5 class="card-title">${character.name}</h5>
                    <p class="card-text">DP: ${character.dp !== null ? character.dp : 'N/A'}</p>
                    <button class="btn btn-primary btn-sm btn-info-team"><i class="bi bi-info-circle"></i></button>
                    <button class="btn btn-danger btn-sm btn-remove-team"><i class="bi bi-trash"></i></button>
                </div>
            `;
            teamContainer.appendChild(card);
        });

        // Add events to the "More Info" buttons
        const infoButtons = teamContainer.querySelectorAll('.btn-info-team');
        infoButtons.forEach(button => {
            button.addEventListener('click', function() {
                const characterId = parseInt(this.closest('.card-team-selected').dataset.id);
                viewDetails(characterId);
            });
        });

        // Add events to the "Remove" buttons
        const removeButtons = teamContainer.querySelectorAll('.btn-remove-team');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const characterId = parseInt(this.closest('.card-team-selected').dataset.id);
                removeCharacterFromTeam(characterId);
            });
        });
    }
}

// Function to scroll the team picker to the left
function teamScrollLeft() {
    const teamContainer = document.getElementById('my-team');
    teamContainer.scrollBy({
        left: -200,
        behavior: 'smooth'
    });
}

// Function to scroll the team picker to the right
function teamScrollRight() {
    const teamContainer = document.getElementById('my-team');
    teamContainer.scrollBy({
        left: 200,
        behavior: 'smooth'
    });
}

// Event for the "Create Team" button
document.getElementById('btn-create-team').addEventListener('click', createTeam);

// Event for the "Back to Menu" button
document.getElementById('btn-back').addEventListener('click', backToMenu);

// Initial load of teams when the application starts
document.addEventListener('DOMContentLoaded', loadTeams);
