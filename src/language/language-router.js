const express = require('express');
const LanguageService = require('./language-service');
const { requireAuth } = require('../middleware/jwt-auth');
const LinkedList = require('./linked-list');

const languageRouter = express.Router();

languageRouter.use(requireAuth).use(async (req, res, next) => {
	try {
		const language = await LanguageService.getUsersLanguage(
			req.app.get('db'),
			req.user.id
		);

		if (!language)
			return res.status(404).json({
				error: `You don't have any languages`,
			});

		req.language = language;
		next();
	} catch (error) {
		next(error);
	}
});

languageRouter.get('/', async (req, res, next) => {
	try {
		const words = await LanguageService.getLanguageWords(
			req.app.get('db'),
			req.language.id
		);

		res.json({
			language: req.language,
			words,
		});
		next();
	} catch (error) {
		next(error);
	}
});

languageRouter.get('/head', async (req, res, next) => {
	try {
		const [nextWord] = await LanguageService.getNextWord(
			req.app.get('db'),
			req.language.id
		);
		res.json({
			nextWord: nextWord.original,
			totalScore: req.language.total_score,
			correctCount: nextWord.correct_count,
			incorrectCount: nextWord.incorrect_count,
		});
		next();
	} catch (error) {
		next(error);
	}
});

languageRouter.route('/guess').post(express.json(), async (req, res, next) => {
	try {
		const guess = req.body.guess;
		const db = req.app.get('db');
		const languageId = req.language.id;
		function swap(array, i, j) {
			const tmp = array[i];
			array[i] = array[j];
			array[j] = tmp;
		}
		function bubbleSort(array) {
			let swaps = 0;
			for (let i = 0; i < array.length - 1; i++) {
				if (array[i].next > array[i + 1].next) {
					swap(array, i, i + 1);
					swaps++;
				}
			}
			if (swaps > 0) {
				return bubbleSort(array);
			}
			return array;
		}

		let headId = await LanguageService.getHeadId(db);

		headId = headId[0].head;

		let head = await LanguageService.getWordById(db, headId);

		console.log('look at me:', head);

		let wordsList = new LinkedList();

		let words = await LanguageService.getLanguageWords(db, languageId);

		//loop through wordsArr to find head.

		//insertLast for head. Loop through head next.

		//insert the next node. Loop to find the next until null.

		let sortedWords = bubbleSort(words);
		let lastWord = sortedWords.shift();
		sortedWords.push(lastWord);

		let score = await LanguageService.getScore(db);
		score = score[0].total_score;

		sortedWords.forEach((word) => wordsList.insertLast(word));

		const isCorrect = LanguageService.checkGuess(guess, wordsList);

		if (isCorrect === true) {
			wordsList.head.value.memory_value = wordsList.head.value.memory_value * 2;
			await LanguageService.updateScore(db, score);
		}

		let currentWord = wordsList.remove(wordsList.head);

		await LanguageService.updateMemory(db, currentWord);

		wordsList.insertAt(currentWord.value.memory_value, currentWord.value);
		//console.log(JSON.stringify(wordsList));

		await LanguageService.insertList(db, wordsList);
		await LanguageService.updateHead(db, wordsList);
		res.send(words);
	} catch (error) {
		next(error);
	}
});

module.exports = languageRouter;
