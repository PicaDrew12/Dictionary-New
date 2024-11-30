const dictionaryElement = document.getElementById('dictionary');
const wordForm = document.getElementById('word-form');

const fetchWords = async () => {
    const response = await fetch('/api/words');
    const words = await response.json();
    renderWords(words);
};

const renderWords = (words) => {
    dictionaryElement.innerHTML = '';
    words.forEach(word => {
        const wordElement = document.createElement('div');
        wordElement.classList.add('word');
        wordElement.innerHTML = `
            <div>
                <strong>${word.name}</strong> (${word.type || 'unknown'})
                <p>${word.definition || ''}</p>
                <p><small>Origin: ${word.origin || ''}, Root: ${word.root || ''}</small></p>
            </div>
            <button onclick="deleteWord('${word.name}')">Delete</button>
        `;
        dictionaryElement.appendChild(wordElement);
    });
};

wordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(wordForm);
    const word = {
        name: formData.get('name'),
        type: formData.get('type'),
        definition: formData.get('definition'),
        origin: formData.get('origin'),
        root: formData.get('root'),
    };
    await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(word),
    });
    wordForm.reset();
    fetchWords();
});

const deleteWord = async (name) => {
    await fetch(`/api/words/${name}`, { method: 'DELETE' });
    fetchWords();
};

fetchWords();
