import axios from 'axios'
import fs from 'fs'

const KEY = "AIzaSyB9smtZDnLSAS5eLa5ObnNjhUlSUlx4CS8"
const API_URL = "https://maps.googleapis.com/maps/api/place"

const RESULTS_PATH = 'results.json'

const delay = time => new Promise(res=>setTimeout(res,time));

async function find () {
	if(!fs.existsSync(RESULTS_PATH)) {
		fs.writeFileSync(RESULTS_PATH, '[]')
	}

	const existing = JSON.parse(fs.readFileSync(RESULTS_PATH))

	let keepSearching = true
	let token = ''

	while (!!keepSearching) {
		const res = await axios.get(
			`${API_URL}/textsearch/json`, 
			{
				params: {
					key: KEY,
					query: 'ravintolat helsinki itäkeskus',
					type: 'restaurant',
					pagetoken: token
				}
			}
		)

		console.log(res.data)

		token = res.data?.next_page_token
		if (!token) keepSearching = false
	
		const results = res.data?.results
	
		for (const result of results) {
			const isDuplicate = existing.find(item => item.place_id === result.place_id)
			if (!!isDuplicate) continue

			existing.push(result)
		}

		fs.writeFileSync(RESULTS_PATH, JSON.stringify(existing))
		fs.writeFileSync('results.js', `const results = ${JSON.stringify(JSON.stringify(existing))}`)

		if (!!token) await delay(5000)
	}
}

find()