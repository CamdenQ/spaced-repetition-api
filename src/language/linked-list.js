class _Node {
	constructor(value, next) {
		(this.value = value), (this.next = next);
	}
}

class LinkedList {
	constructor() {
		this.head = null;
		this.length = 0;
	}

	insertFirst(item) {
		this.head = new _Node(item, this.head);
		this.length = this.length + 1;
	}

	insertLast(item) {
		if (this.head === null) {
			this.insertFirst(item);
		} else {
			let tempNode = this.head;
			while (tempNode.next !== null) {
				tempNode = tempNode.next;
			}
			tempNode.next = new _Node(item, null);
		}

		this.length = this.length + 1;
	}

	insertAfter(key, itemToInsert) {
		let tempNode = this.head;
		while (tempNode !== null && tempNode.value !== key) {
			tempNode = tempNode.next;
		}
		if (tempNode !== null) {
			tempNode.next = new _Node(itemToInsert, tempNode.next);
		}
		this.length = this.length + 1;
	}

	insertBefore(key, itemToInsert) {
		if (this.head == null) {
			return;
		}
		if (this.head.value == key) {
			this.insertFirst(itemToInsert);
			this.length = this.length + 1;
			return;
		}
		let prevNode = null;
		let currNode = this.head;
		while (currNode !== null && currNode.value !== key) {
			prevNode = currNode;
			currNode = currNode.next;
		}
		if (currNode === null) {
			console.log('Node not found to insert');
			return;
		}
		prevNode.next = new _Node(itemToInsert, currNode);
		this.length = this.length + 1;
	}
	// insertAt(nthPosition, itemToInsert) {
	// 	if (nthPosition < 0) {
	// 		throw new Error('Position error');
	// 	}
	// 	if (nthPosition == 0) {
	// 		this.insertFirst(itemToInsert);
	// 		this.length = this.length + 1;
	// 	} else {
	// 		const node = this._findNthElement(nthPosition);
	// 		const newNode = new _Node(itemToInsert, null);
	// 		newNode.next = node;
	// 		const prevNode = this._findNthElement(nthPosition - 1);
	// 		prevNode.next = newNode;
	// 		this.length = this.length + 1;
	// 	}
	// }
	insertAt(pos, item) {
		let counter = 0;
		let currNode = this.head;
		let prevNode = null;
		while (counter < pos && counter < this.length - 1) {
			prevNode = currNode;
			currNode = currNode.next;
			counter++;
		}
		if (prevNode) {
			let newNode = new _Node(item, currNode);
			prevNode.next = newNode;
			prevNode.value.next = newNode.value.id;
		} else {
			let newNode = new _Node(item, currNode);
			newNode.value.next = this.head.value.id;
			this.head = newNode;
		}
		// this.length = this.length + 1;
	}
	_findNthElement(position) {
		let node = this.head;
		for (let i = 0; i < position; i++) {
			node = node.next;
		}
		return node;
	}
	remove(item) {
		if (!this.head) {
			return null;
		}
		if (this.head === item) {
			this.head = this.head.next;
			this.length = this.length - 1;
			return item;
		}
		let currNode = this.head;
		let previousNode = this.head;
		while (currNode !== null && currNode.value !== item) {
			previousNode = currNode;
			currNode = currNode.next;
		}
		if (currNode === null) {
			console.log('Item not found');
			return;
		}
		previousNode.next = currNode.next;
		this.length = this.length - 1;
		return item;
	}
	find(item) {
		let currNode = this.head;
		if (!this.head) {
			return null;
		}
		while (currNode.value !== item) {
			if (currNode.next === null) {
				return null;
			} else {
				currNode = currNode.next;
			}
		}
		return currNode;
	}
}

module.exports = LinkedList;
