const fs = require('fs') ;
const csv = require('csv-parser');
const { performance } = require('perf_hooks');
// Specify the file paths here
const inputFile = 't8.shakespeare.txt'
const dictionaryFile = 'french_dictionary.csv'
const findWordsFile = 'find_words.txt';
const outputFile = 'output.txt';

// Function to replace words in the input text file

function replaceWords(inputFile, dictionaryFile, findWordsFile, outputFile) {
    const replacements = {};
  
    // Read the dictionary file and create a map of English to French words
    fs.createReadStream(dictionaryFile)
      .pipe(csv())
      .on('data', (data) => {
        const englishWord = data.english.toLowerCase()
        const frenchWord = data.french;
        replacements[englishWord] = frenchWord;
      })
      .on('end', () => {
        let replacedWords = {};
        let numReplacements = 0; 
        // Read the find words list and process the input text file
        fs.readFile(findWordsFile, 'utf8', (err, findWordsData) => {
          if (err) throw err;
  
          const findWordsList = findWordsData.split('\n').filter(Boolean);
  
          // Read the input text file, find and replace words
          fs.readFile(inputFile, 'utf8', (err, inputData) => {
            if (err) throw err;
  
            const words = inputData.split(/\b/);
            let outputData = '';
  
            const start = performance.now();
  
            for (const word of words) {
              const lowercaseWord = word.toLowerCase();
  
              if (findWordsList.includes(lowercaseWord) && replacements[lowercaseWord]) {
                const replacement = replacements[lowercaseWord];
                replacedWords[word] = replacement;
                numReplacements++;
                outputData += word.replace(new RegExp(`\\b${lowercaseWord}\\b`, 'g'), replacement);
              } else {
                outputData += word;
              }
            }
  
            const end = performance.now();
            const timeTaken = end - start;
  
            // Write the processed output file
            fs.writeFile(outputFile, outputData, (err) => {
              if (err) throw err;
  
              const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // Convert to MB
  
              // Display the results
              console.log('Replaced words:', Object.values(replacedWords).filter((v, i, a) => a.indexOf(v) === i));
              console.log('Number of replacements:', numReplacements);
              console.log('Time taken:', timeTaken.toFixed(2) + 'ms');
              console.log('Memory used:', memoryUsage.toFixed(2) + 'MB');
            });
          });
        });
      });
  }
  
  // Call the function to replace words
  replaceWords(inputFile, dictionaryFile, findWordsFile, outputFile);