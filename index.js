'use strict';
const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();
const redis = require('redis');
const words = [
	'bakerloo',
	'barking',
	'barnet',
	'bexley',
	'bike',
	'brent',
	'bromley',
	'bus',
	'camden',
	'central',
	'chelsea',
	'circle',
	'commute',
	'crossrail',
	'croydon',
	'cycle',
	'cycleway',
	'dagenham',
	'delay',
	'district',
	'dlr',
	'ealing',
	'elizabeth',
	'enfield',
	'euston',
	'fare',
	'fulham',
	'gatwick',
	'gla',
	'greenwich',
	'hackney',
	'hammersmith',
	'haringey',
	'harrow',
	'havering',
	'heathrow',
	'hillingdon',
	'hounslow',
	'interchange',
	'islington',
	'journey',
	'jubilee',
	'kensington',
	'kingscross',
	'kingston',
	'lambeth',
	'lewisham',
	'liverpoolst',
	'london',
	'londonbridge',
	'map',
	'merton',
	'metropolitan',
	'newham',
	'northern',
	'offpeak',
	'overground',
	'oyster',
	'paddington',
	'peak',
	'piccadilly',
	'platform',
	'platform',
	'railcard',
	'redbridge',
	'richmond',
	'route',
	'route',
	'rushhour',
	'schedule',
	'southwark',
	'stop',
	'stpancras',
	'stratford',
	'sutton',
	'taxi',
	'tfl',
	'ticket',
	'ticket',
	'timetable',
	'timetable',
	'tower-hamlets',
	'train',
	'tramlink',
	'travelcard',
	'tube',
	'underground',
	'victoria',
	'waltham-forest',
	'wandsworth',
	'waterloo',
	'waterloo',
	'westminster',
	'zone',
	'zone1',
	'zone2',
	'zone3',
	'zone4',
	'zone5',
	'zone6',
	'zone7',
	'zone8',
	'zone9'
];
async function generateUniqueString(hash) {
	const value = await client.get('keys');
	const inUse = JSON.parse(value);
	let phrase = '';
	const one = Math.floor(Math.random() * words.length),
		two = Math.floor(Math.random() * words.length),
		three = Math.floor(Math.random() * words.length),
		four = Math.floor(Math.random() * words.length);
	phrase = words[one] + '.' + words[two] + '.' + words[three] + '.' + words[four];
	if (inUse['keys'].includes(phrase)) {
		return generateUniqueString();
	} else {
		inUse['keys'].push(phrase);
		await client.set('keys', JSON.stringify(inUse));
		return phrase;
	}
}
async function checkAndGet(hash) {
	const hashList = await client.get('hashList');
	const list = JSON.parse(hashList);
	if (list[hash]) {
		return list[hash];
	} else {
		const newPhrase = await generateUniqueString();
		list[hash] = newPhrase;
		await client.set('hashList', JSON.stringify(list));
		return newPhrase;
	}
}
const client = redis.createClient({
	password: process.env.redisPW,
	socket: {
		host: 'redis-12926.c78.eu-west-1-2.ec2.cloud.redislabs.com',
		port: 12926
	}
});
client.on('error', (err) => console.log('Redis Client Error', err));
async function getHash(vars) {
	const key = `${vars.one}.${vars.two}.${vars.three}.${vars.four}`;
	const hash = await client.get(key);
	if (hash === null) {
		throw new Error("Hash couldn't be found.");
	}
	return hash;
}
app.get('/:one.:two.:three.:four', async (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});
app.get('/phrase/:one.:two.:three.:four', async (req, res) => {
	try {
		const hash = await getHash(req.params);
		res.status(200).json({hash});
	} catch (err) {
		res.status(404).json({error: err.message});
	}
});
app.get('/hash/:hash', async (req, res) => {
	const hashCheck = await checkAndGet(req.params.hash);
	await client.set(hashCheck, req.params.hash);
	res.status(200).json({phrase: hashCheck});
});
app.use('/', express.static(path.join(__dirname, 'public')));
app.listen(3000, async () => {
	console.log('Listening on port 3000');
	await client.connect();
});
