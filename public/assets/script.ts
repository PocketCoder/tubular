class UserDataHandler {
	// TODO: Handle hash being not right.
	// TODO: Clean URL
	constructor() {
		this.usrDataObj = {bus: [], stations: []};
		this.URLInputEl = document.getElementById('url');
		this.wlh = window.location.hash;
		this.wlp = window.location.pathname;
		this.hash = '';
		this.phrase = '';
		this.type = 'none';
		if (this.wlh === '' && (this.wlp === '/' || this.wlp === '')) {
			// First visit
		} else if (this.wlh !== '' && (this.wlp === '/' || this.wlp === '')) {
			// Subsequent visit with hash.
			this.type = 'hash';
			if (this.wlh.startsWith('#')) {
				this.hash = this.wlh.substring(1);
			}
			this.loadData();
		} else if ((this.wlp !== '' || this.wlp !== '/') && this.wlh === '') {
			// Subsequent visit with code
			this.type = 'path';
			if (this.wlp.startsWith('/')) {
				this.phrase = this.wlp.substring(1);
			}
			this.loadData();
		}
	}

	async loadData() {
		if (this.type === 'none') {
			// Do nothing
			this.urlElement.innerHTML = '/# ' + 'Add to the map to generate your URL' + '...';
			return;
		} else if (this.type === 'hash') {
			// Decode hash
			this.usrDataObj = JSON.parse(LZString.decompressFromEncodedURIComponent(this.hash));
			this.URLInputEl.placeholder = '/#' + this.hash.substring(0, 27) + '...';
			return;
		} else if (this.type === 'path') {
			// Fetch hash and decode.
			const res = await fetch(`/hash/${this.phrase}`);
			const data = await res.json();
			this.URLInputEl.placeholder = this.wlp;
			data
				.then((d) => {
					const hash = d.hash;
					try {
						const hashData = JSON.parse(LZString.decompressFromEncodedURIComponent(d.hash));
						this.usrDataObj = hashData;
					} catch (e) {
						console.error(e);
					}
				})
				.catch((e) => {
					console.error(e);
				});
			return;
		} else {
			throw new Error('loadData() & this.type error.');
		}
	}

	async get(type: string): Promise<string[]> {
		if (type === 'stations') {
			return this.usrDataObj.stations;
		} else if (type === 'bus') {
			return this.usrDataObj.bus;
		} else {
			throw new Error(`Invalid argument: type must be 'stations' or 'bus'`);
		}
	}

	async save(type: string, data: Array<string> | string) {
		if (!type || (type !== 'stations' && type !== 'bus')) {
			throw new Error("Invalid argument: type must be 'stations' or 'bus'");
		}

		const newData = Array.isArray(data) ? data : [data];

		if (newData.some((d) => typeof d !== 'string')) {
			throw new Error('Invalid argument: data must be a string or an array of strings.');
		}

		if (type === 'stations') {
			this.usrDataObj.stations.push(...newData);
		} else if (type === 'bus') {
			this.usrDataObj.bus.push(...newData);
		}

		const unique = Array.from(new Set(this.usrDataObj[type]));
		unique.sort();
		if (type === 'stations') {
			this.usrDataObj.stations = unique;
		} else if (type === 'bus') {
			this.usrDataObj.bus = unique;
		}

		const newHash = LZString.compressToEncodedURIComponent(JSON.stringify(this.usrDataObj));
		this.newHashSort(newHash);
	}

	async newHashSort(newHash: string) {
		window.location.hash = newHash;
		this.wlh = window.location.hash;
	}

	async loadNewHash(usrHash: string) {
		try {
			const newData = JSON.parse(LZString.decompressFromEncodedURIComponent(usrHash));
			if (
				newData.stations === undefined ||
				newData.stations === null ||
				newData.bus === undefined ||
				newData.bus === null
			) {
				throw new Error('Invalid Hash');
			} else {
				this.hash = usrHash;
				this.type = 'hash';
				this.usrDataObj = newData;
				this.newHashSort(usrHash);
				window.location.reload();
				return true;
			}
		} catch (e) {
			console.log(e);
			throw new Error(`${e}`);
		}
	}

	getHash() {
		return this.hash;
	}

	async loadNewPhrase(phrase: string) {
		// Fetch hash and decode.
		const res = await fetch(`/phrase/${phrase}`);
		const data = await res.json().catch((e) => {
			console.error(e);
		});
		const hash = data.hash;
		try {
			this.loadNewHash(hash);
		} catch (e) {
			console.error(e);
		}
		return this.usrDataObj;
	}

	async getNewPhrase() {
		// Fetch phrase
		const res = await fetch(`/hash/${this.hash}`);
		const data = await res.json().catch((e) => {
			console.error(e);
		});
		return data.phrase;
	}
}

const DH = new DataHandler();

document.getElementById('url')!.addEventListener('keyup', async (e) => {
	const urlEl = <HTMLInputElement>document.getElementById('url');
	const input = e.target.value;
	if (e.key === 'Enter' || e.keyCode === 13) {
		if (input === null || input === '' || input === undefined) {
			popUp('Enter your code or phrase', 'error');
			urlEl.placeholder = '/# ' + 'Add to the map to generate your URL' + '...';
			return;
		} else {
			try {
				DH.processInput(input);
			} catch (e) {
				popUp('Error', 'error', e);
			}
		}
	}
});

document.getElementById('url')!.addEventListener('paste', async (e) => {
	const urlEl = <HTMLInputElement>document.getElementById('url');
	const pasted = e.clipboardData?.getData('text')!;
	let type = '';
	if (pasted === '' || pasted === null) {
		popUp('Paste your code or phrase', 'error');
		urlEl.placeholder = '/# ' + 'Add to the map to generate your URL' + '...';
		return;
	} else {
		try {
			DH.processInput(pasted);
		} catch (e) {
			popUp('Error', 'error', e);
		}
	}
});

function findVisCodes(arr: Array<string>) {
	const stnArr: Array<string> = [...arr];
	let visArr: Array<string> = [];
	for (const stn of stnArr) {
		visArr.push(stations[stn]);
	}
	return visArr;
}

function addStnsToMap(stns) {
	let unique;
	if (stns.stations !== undefined) {
		unique = stns.stations.filter((c: string, i: number) => {
			return stns.stations.indexOf(c) === i;
		});
	} else {
		unique = stns.filter((c: string, i: number) => {
			return stns.indexOf(c) === i;
		});
	}
	unique.sort();
	unique.forEach((v: string) => {
		document.querySelector(`[id*="${stations[v]}-dash"]`)?.classList.add('visible');
		document.querySelector(`[id*="${stations[v]}-label"]`)?.classList.add('visible');
		document.querySelector(`[id*="IC_${stations[v]}"]`)?.classList.add('visible');
	});
}

async function updateLineSegs(usrData: Array<string>) {
	let stnCodes: Array<string>;
	if (usrData.stations !== 'undefined') {
		stnCodes = findVisCodes(usrData);
	} else {
		stnCodes = findVisCodes(usrData.stations);
	}
	let data: {[line: string]: number} = {
		bakerloo: 0,
		central: 0,
		piccadilly: 0,
		jubilee: 0,
		metropolitan: 0,
		victoria: 0,
		northern: 0,
		circle: 0,
		'hammersmith-city': 0,
		district: 0,
		elizabeth: 0,
		overground: 10,
		'waterloo-city': 0,
		'cable-car': 0,
		dlr: 0,
		tram: 0,
		OSI: 0
	};
	for (const l in lines) {
		const lineObj = lines[l];
		if (lineObj['branch']) {
			// Check if top branches are active.
			function top() {
				let active = false;
				lineObj['top']!.forEach((a: string[]) => {
					a.forEach((s) => {
						if (stnCodes.includes(s)) {
							active = true;
						} else {
							// Hasn't been visited.
						}
					});
				});
				return active;
			}

			// Check if bottom branches are active
			function bottom() {
				let active = false;
				lineObj['bottom']!.forEach((a: string[]) => {
					a.forEach((s) => {
						if (stnCodes.includes(s)) {
							active = true;
						} else {
							// Hasn't been visited.
						}
					});
				});
				return active;
			}

			// Complete the line segments.
			function complete(top: Boolean, bottom: Boolean) {
				// If the top and bottom branches are active then go from the the first visited station of the top branches in those arrays to the last station, then from the first station of the bottom branches to the last visited station.
				if (top && bottom) {
					let total = 0;
					lineObj['top']!.forEach((e: string[]) => {
						let first = 100;
						e.forEach((a) => {
							const index = e.indexOf(a);
							if (stnCodes.includes(a)) {
								total++;
								if (index <= first) {
									first = index;
								}
							}
						});
						for (let i = first; i < e.length; i++) {
							document.getElementById(`lul-${lineObj['line']}_${e[i]}-${e[i + 1]}`)?.classList.add('visible');
						}
					});
					lineObj['bottom']!.forEach((e) => {
						let last = 0;
						e.forEach((a: string) => {
							const index = e.indexOf(a);
							if (stnCodes.includes(a)) {
								total++;
								if (index >= last) {
									last = index;
								}
							}
						});
						for (let i = 0; i < last; i++) {
							document.getElementById(`lul-${lineObj['line']}_${e[i]}-${e[i + 1]}`)?.classList.add('visible');
						}
					});
					data[lineObj['line']] = data[lineObj['line']] + total;
				} else if (top) {
					let total = 0;
					lineObj['top']!.forEach((e) => {
						let first = 100,
							last = 0;
						e.forEach((a) => {
							const index = e.indexOf(a);
							if (stnCodes.includes(a)) {
								total++;
								if (index <= first) {
									first = index;
								} else if (index >= last) {
									last = index;
								} else {
									// Error!
								}
							}
						});
						for (let i = first; i < last; i++) {
							document.getElementById(`lul-${lineObj['line']}_${e[i]}-${e[i + 1]}`)?.classList.add('visible');
						}
					});
					data[lineObj['line']] = data[lineObj['line']] + total;
				} else if (bottom) {
					let total = 0;
					lineObj['bottom']!.forEach((e) => {
						let first = 100,
							last = 0;
						e.forEach((a) => {
							const index = e.indexOf(a);
							if (stnCodes.includes(a)) {
								total++;
								if (index <= first) {
									first = index;
								} else if (index >= last) {
									last = index;
								} else {
									// Error!
								}
							}
						});
						for (let i = first; i < last; i++) {
							document.getElementById(`lul-${lineObj['line']}_${e[i]}-${e[i + 1]}`)?.classList.add('visible');
						}
					});
					data[lineObj['line']] = data[lineObj['line']] + total;
				}
			}
			complete(top(), bottom());
		} else {
			const lineArr = lineObj['stations']!;
			let first = 100,
				last = 0,
				total = 0;
			lineArr.forEach((a) => {
				const index = lineArr.indexOf(a);
				if (stnCodes.includes(a)) {
					total++;
					if (index < first) {
						first = index;
					} else if (index > last) {
						last = index;
					} else {
						// Error!
					}
				}
			});
			for (let i = first; i < last; i++) {
				document.getElementById(`lul-${lineObj['line']}_${lineArr[i]}-${lineArr[i + 1]}`)?.classList.add('visible');
			}
			data[lineObj['line']] = data[lineObj['line']] + total;
		}
	}
	updateStats(data);
}

function updateStats(data: {[line: string]: number}) {
	const totals: {[line: string]: number} = {
		bakerloo: 25,
		central: 49,
		piccadilly: 53,
		jubilee: 27,
		metropolitan: 34,
		victoria: 16,
		northern: 52,
		circle: 36,
		'hammersmith-city': 29,
		district: 60,
		elizabeth: 32,
		overground: 112,
		'waterloo-city': 2,
		'cable-car': 2,
		dlr: 45,
		tram: 39,
		OSI: 0
	};
	for (const l in totals) {
		let percent: number = 0,
			visited: number;
		if (l === 'OSI') continue;
		if (data[l] === NaN) {
			document.getElementById(`js-lp-${l}`)!.innerText = '0%';
		} else {
			const total: number = totals[l];
			visited = data[l];
			percent = Math.floor((visited / total) * 100);
		}
		document.getElementById(`js-lp-${l}`)!.innerText = percent.toString() + '%';
	}
}

function readFile(file: File) {
	const reader = new FileReader();

	reader.readAsText(file, 'UTF-8');

	// reader.onprogress = updateProgress;
	reader.onload = async (evt) => {
		const fileString: any = evt.target!.result || '';
		const CSVarr = CSVtoArray(fileString);
		await loadData(CSVarr);
	};

	reader.onerror = (err) => {
		console.error(err);
	};
}

async function loadData(arr: string[][]) {
	let stations: string[] = [],
		busses: string[] = [];
	for (const a in arr) {
		const journey = arr[a][3];
		if (journey == undefined) continue;
		if (journey.toLowerCase().indexOf('bus') !== -1) {
			const bus = journey.split('route ')[1];
			if (!busses.includes(bus)) {
				busses.push(bus);
			}
		} else if (journey.toLowerCase().indexOf(' to ') !== -1) {
			const j = journey.split(' to ');
			const s = j.map((d) => {
				const regEx = /( \[.*\])|( DLR)|( tram stop)|(\[No touch-out\])/;
				return d.replace(regEx, '');
			});
			for (const i in s) {
				if (!stations.includes(s[i])) {
					stations.push(s[i]);
				}
			}
		}
	}
	try {
		await DataHandler.save('stations', stations);
		await DataHandler.save('bus', busses);
	} catch (e) {
		console.error(`[script.ts | loadData()]: ${e}`);
	} finally {
		addStnsToMap(stations);
		const usrStns = await DataHandler.get('stations');
		await updateLineSegs(usrStns);
	}
}

function CSVtoArray(strData: string, strDelimiter = ',') {
	// https://gist.github.com/luishdez/644215
	strDelimiter = strDelimiter || ',';
	let objPattern = new RegExp(
		// Delimiters.
		'(\\' +
			strDelimiter +
			'|\\r?\\n|\\r|^)' +
			// Quoted fields.
			'(?:"([^"]*(?:""[^"]*)*)"|' +
			// Standard fields.
			'([^"\\' +
			strDelimiter +
			'\\r\\n]*))',
		'gi'
	);

	let arrData: string[][] = [[]];
	let arrMatches: any = null;

	while ((arrMatches = objPattern.exec(strData))) {
		let strMatchedDelimiter = arrMatches[1];
		if (strMatchedDelimiter.length && strMatchedDelimiter != strDelimiter) {
			arrData.push([]);
		}

		let strMatchedValue: any;
		if (arrMatches[2]) {
			strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
		} else {
			strMatchedValue = arrMatches[3];
		}
		arrData[arrData.length - 1].push(strMatchedValue);
	}
	return arrData;
}

function dragOverHandler(e: any) {
	e.preventDefault();
	document.getElementById('drag')?.classList.add('dragOver');
}

function dragLeaveHandler(e: any) {
	e.preventDefault();
	document.getElementById('drag')?.classList.remove('dragOver');
}

function dropHandler(e: any) {
	e.preventDefault();
	const file = e.dataTransfer.items[0].getAsFile();
	readFile(file);
	document.getElementById('drag')?.classList.remove('dragOver');
}
