const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

// Use environment variable for port (Fly.io expects the app to listen on port 8080 by default)
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const DICTIONARY_FILE = path.join(__dirname, 'data', 'dictionary.json');

// Helper functions to load and save the dictionary
const loadDictionary = () => {
  if (!fs.existsSync(DICTIONARY_FILE)) {
    fs.writeFileSync(DICTIONARY_FILE, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(DICTIONARY_FILE, 'utf8'));
};

const saveDictionary = (data) => {
  fs.writeFileSync(DICTIONARY_FILE, JSON.stringify(data, null, 2));
};

// API to get all words
app.get('/api/words', (req, res) => {
  const dictionary = loadDictionary();
  res.json(dictionary);
});

// API to get a specific word by name
app.get('/api/words/:name', (req, res) => {
  const { name } = req.params;
  const dictionary = loadDictionary();
  const word = dictionary.find((w) => w.name === name);
  if (word) {
    res.json(word);
  } else {
    res.status(404).json({ error: 'Word not found' });
  }
});

app.post('/api/words', (req, res) => {
    const newWord = req.body;
    newWord.name = newWord.name.toLowerCase(); // Ensure name is stored in lowercase
  
    const dictionary = loadDictionary();
    dictionary.push(newWord);
    saveDictionary(dictionary);
    res.json(newWord);
});

// API to update an existing word
app.put('/api/words/:name', (req, res) => {
    const { name } = req.params;
    const updatedWord = req.body;
    updatedWord.name = updatedWord.name.toLowerCase(); // Ensure name is stored in lowercase
  
    let dictionary = loadDictionary();
    const index = dictionary.findIndex((w) => w.name === name.toLowerCase());
  
    if (index !== -1) {
      dictionary[index] = updatedWord;
      saveDictionary(dictionary);
      res.json(updatedWord);
    } else {
      res.status(404).json({ error: 'Word not found' });
    }
});

// API to delete a word
app.delete('/api/words/:name', (req, res) => {
  const { name } = req.params;
  let dictionary = loadDictionary();
  dictionary = dictionary.filter((word) => word.name !== name);
  saveDictionary(dictionary);
  res.json({ success: true });
});

// Start server (Listen on 0.0.0.0 to work with Fly.io)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
