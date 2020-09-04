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
    const userId = req.user.id;

    let headId = await LanguageService.getHeadId(db, userId);

    headId = headId[0].head;

    let head = await LanguageService.getWordById(db, headId);

    let words = await LanguageService.getLanguageWords(db, languageId);

    let wordsList = LanguageService.createList(head, words);

    let score = await LanguageService.getScore(db);
    score = score[0].total_score;

    const isCorrect = LanguageService.checkGuess(guess, wordsList);

    if (isCorrect === true) {
      wordsList.head.value.memory_value = wordsList.head.value.memory_value * 2;
      await LanguageService.updateScore(db, score, userId);
    }

    let currentWord = wordsList.remove(wordsList.head);

    await LanguageService.updateMemory(db, currentWord);

    wordsList.insertAt(currentWord.value.memory_value, currentWord.value);

    await LanguageService.insertList(db, wordsList);
    await LanguageService.updateHead(db, wordsList, userId);
    res.send(wordsList);
  } catch (error) {
    next(error);
  }
});

module.exports = languageRouter;
