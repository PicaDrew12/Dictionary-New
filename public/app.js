const wordForm = document.getElementById('word-form');
const wordList = document.getElementById('word-list');
const searchBar = document.getElementById('search-bar');
const sortOptions = document.getElementById('sort-options');

const API_URL = '/api/words';

let words = [];

// Fetch and display all words
async function fetchWords() {
  const res = await fetch(API_URL);
  words = await res.json();
  renderWords(words);
}

// Render words on the page
// Utility function to capitalize the first letter of a word
function capitalizeFirstLetter(word) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  
  // Render words on the page
// Function to render words on the page with word type specific color
function renderWords(filteredWords) {
    wordList.innerHTML = '';  // Clear previous results
    filteredWords.forEach((word) => {
      const wordItem = document.createElement('div');
      wordItem.className = `word-item ${word.type}`;  // Dynamically add class for word type
      wordItem.innerHTML = `
        <strong>${capitalizeFirstLetter(word.name)}</strong> (${capitalizeFirstLetter(word.type) || 'N/A'})<br>
        <em>${word.definition || 'No definition'}</em><br>
        Origin: ${word.origin || 'Unknown'}, Root: ${word.root || 'None'}<br>
        <button onclick="navigateToEdit('${word.name}')">Edit</button>
        <button onclick="deleteWord('${word.name}')">Delete</button>
      `;
      wordList.appendChild(wordItem);
    });
  }
  
  
// Navigate to the edit page
function navigateToEdit(name) {
  window.location.href = `/edit.html?name=${encodeURIComponent(name)}`;
}

// Add a new word
wordForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newWord = {
    name: document.getElementById('name').value,
    type: document.getElementById('type').value,
    definition: document.getElementById('definition').value,
    origin: document.getElementById('origin').value,
    root: document.getElementById('root').value,
  };
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newWord),
  });
  wordForm.reset();
  fetchWords();
});

// Delete a word
async function deleteWord(name) {
  if (confirm('Are you sure you want to delete this word?')) {
    await fetch(`${API_URL}/${name}`, { method: 'DELETE' });
    fetchWords();
  }
}

// Search functionality (fuzzy search)
searchBar.addEventListener('input', () => {
  const query = searchBar.value.toLowerCase();
  const filteredWords = words.filter((word) => {
    return (
      word.name.toLowerCase().includes(query) ||
      word.type.toLowerCase().includes(query) ||
      (word.definition && word.definition.toLowerCase().includes(query))
    );
  });
  renderWords(filteredWords);
});

// Sorting functionality
function sortWords(criteria) {
  let sortedWords = [...words]; // Make a copy of the words array
  if (criteria === 'name') {
    sortedWords.sort((a, b) => a.name.localeCompare(b.name));
  } else if (criteria === 'type') {
    sortedWords.sort((a, b) => a.type.localeCompare(b.type));
  }
  renderWords(sortedWords);
}

// Load word data in the edit form
async function loadWordForEdit() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name');
  if (!name) return;

  const res = await fetch(`/api/words/${name}`);
  if (res.ok) {
    const word = await res.json();
    document.getElementById('name').value = word.name;
    document.getElementById('type').value = word.type || ''; // Set dropdown value
    document.getElementById('definition').value = word.definition || '';
    document.getElementById('origin').value = word.origin || '';
    document.getElementById('root').value = word.root || '';
  }
}

// Handle edit form submission
async function handleEditFormSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const updatedWord = {
    name,
    type: document.getElementById('type').value,
    definition: document.getElementById('definition').value,
    origin: document.getElementById('origin').value,
    root: document.getElementById('root').value,
  };

  await fetch(`/api/words/${name}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedWord),
  });

  // Redirect to the main page
  window.location.href = '/';
}

// Attach events and initialize
if (window.location.pathname === '/edit.html') {
  document.getElementById('edit-form').addEventListener('submit', handleEditFormSubmit);
  loadWordForEdit();
} else {
  fetchWords();
}
