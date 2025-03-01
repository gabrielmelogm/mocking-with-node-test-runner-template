export default class TodoRepository {
	#schedule
	constructor({ db }) {
		this.#schedule = db.addCollection('schedule')
	}

	async list() {
		// deveria ser um .project() mas não temos no lokijs
		return this.#schedule.find().map(({ meta, $loki, ...result }) => result)
	}

	async create(data) {
		const { $loki, meta, ...result } = this.#schedule.insertOne(data)
		return result
	}
}
