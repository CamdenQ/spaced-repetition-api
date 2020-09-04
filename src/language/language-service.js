const LinkedList = require('./linked-list');

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.user_id', user_id)
      .first();
  },
  getWordById(db, id) {
    return db.from('word').select('*').where({ id: id });
  },

  getHeadId(db, user_id) {
    return db
      .from('language')
      .select('language.head')
      .where('language.user_id', user_id);
  },

  getScore(db, user_id) {
    return db
      .from('language')
      .select('language.total_score')
      .where('language.user_id', user_id);
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id });
  },

  getNextWord(db, language_id) {
    return db
      .from('word')
      .join('language', 'word.id', '=', 'language.head')
      .select('original', 'language_id', 'correct_count', 'incorrect_count')
      .where({ language_id });
  },

  checkGuess(guess, words) {
    let isCorrect = guess.trim().toLowerCase() === words.head.value.translation;

    return isCorrect;
  },

  insertList(db, list) {
    let counter = 0;
    let currNode = list.head;

    while (counter < list.length - 1) {
      db.update({ next: currNode.next.value.id })
        .from('word')
        .where({ id: currNode.value.id })
        .then(() => (counter = counter));
      currNode = currNode.next;
      counter++;
    }
    return db
      .update({ next: null })
      .from('word')
      .where({ id: currNode.value.id });
  },

  updateMemory(db, head) {
    // prettier-ignore
    return db.from('word')
			.where({ id: head.value.id }).update({ memory_value: head.value.memory_value });
  },
  updateHead(db, list, user_id) {
    return db
      .from('language')
      .where('language.user_id', user_id)
      .update({ head: list.head.value.id });
  },
  updateScore(db, score, user_id) {
    let newScore = score + 1;
    return db
      .from('language')
      .update({ total_score: newScore })
      .where('language.user_id', user_id);
  },
  increaseCorrectCount(db, word) {
    let newCount = word.value.correctCount + 1;
    return db
      .from('word')
      .where({ id: word.value.id })
      .update({ correct_count: newCount });
  },
  increaseIncorrectCount(db, word) {
    let newCount = word.value.incorrectCount + 1;
    return db
      .from('word')
      .where({ id: word.value.id })
      .update({ incorrect_count: newCount });
  },
  createList(head, arr) {
    let currNode = head[0];
    let list = new LinkedList();
    list.insertLast(currNode);

    while (currNode.next !== null) {
      let wordToInsert = arr.find((word) => word.id === currNode.next);
      list.insertLast(wordToInsert);

      currNode = wordToInsert;
    }
    return list;
  },
};

module.exports = LanguageService;
