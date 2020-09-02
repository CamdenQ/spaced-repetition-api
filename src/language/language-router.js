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

languageRouter.post('/guess', async (req, res, next) => {
	try {
		console.log(req);
		const guess = req.guess;
		const db = req.app.get('db');
		const languageId = req.language.id;

		let wordsList = new LinkedList();

		let words = await LanguageService.getLanguageWords(db, languageId);

		words.forEach((word) => {
			wordsList.insertLast(word);
		});
		const isCorrect = LanguageService.checkGuess(guess, wordsList);
		if (isCorrect === true) {
			wordsList.head.memory_value = wordsList.head.memory_value * 2;
		}
		let currentWord = wordsList.remove(wordsList.head);

		wordsList.insertAt(wordsList.head.memory_value - 1, currentWord);
		let wordsArr = [];
		for (let i = 0; i < wordsList.length; i++) {
			wordsArr.push(wordsList._findNthElement(i));
		}
		res.send(wordsArr);
	} catch (error) {
		next(error);
	}
});

module.exports = languageRouter;
