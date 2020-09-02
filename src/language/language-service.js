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

	// populateList(db, language_id) {
	// 	try {
	// 		const words = await this.getLanguageWords(db, language_id);
	// 		console.log(words)
	// 		let wordsList = new LinkedList();

	// 		words.forEach((word) => {
	// 			wordsList.insertLast(word);
	// 		});
	// 		return wordsList;
	// 	} catch (error) {
	// 		next(error);
	// 	}
	// },

	checkGuess(guess, words) {
		return guess.trim().toLowerCase() === words.head.translation;
	},

	insertList(db, language_id, list) {
		db.raw('TRUNCATE TABLE word');
		db.insert(list).into('word').where({ language_id });
		return;
	},
};

module.exports = LanguageService;
