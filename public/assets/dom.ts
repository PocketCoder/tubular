interface Window {
	setItem(x: any, y: any): any;
	removeItem(x: any): any;
}

let panInst: any;
let mapInst = 'tube';
const mapEl = document.getElementById('map') as HTMLDivElement;

function storageAvailable(type: any) {
	var storage;
	try {
		storage = window[type];
		var x = '__storage_test__';
		// @ts-ignore
		storage.setItem(x, x);
		// @ts-ignore
		storage.removeItem(x);
		return true;
	} catch (e) {
		return (
			e instanceof DOMException &&
			// everything except Firefox
			(e.code === 22 ||
				// Firefox
				e.code === 1014 ||
				// test name field too, because code might not be present
				// everything except Firefox
				e.name === 'QuotaExceededError' ||
				// Firefox
				e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
			// acknowledge QuotaExceededError only if there's something already stored
			storage &&
			storage.length !== 0
		);
	}
}

function populateMapData() {
	if (!storageAvailable('localStorage')) {
		popUp("LocalStorage isn't supported", 'error');
		alert("LocalStorage isn't supported");
		throw new Error('No localStorage available');
	} else {
		if (localStorage.getItem('stations') !== null) {
			document.getElementById('js-welcome')!.style.display = 'none';
			addStnsToMap(usrData('get', 'stations'));
			updateLineSegs();
		} else {
			document.getElementById('js-footer')!.classList.toggle('aside-active');
			document.getElementById('js-aside')!.classList.toggle('aside-out');
		}
	}
}

function loadMap(map: string) {
	mapEl.innerHTML = '';
	fetch(`./assets/${map}-map.svg`)
		.then((res) => res.text())
		.then((data) => {
			mapEl.innerHTML = data;
			const elem = document.getElementById(`${map}-map`) as HTMLDivElement;
			elem.style.opacity = '0';
			setTimeout(() => {
				elem.style.opacity = '1';
			}, 500);
			// @ts-ignore
			panInst = panzoom(elem, {
				filterKey: () => {
					return true;
				},
				autoCenter: true,
				maxZoom: 4,
				minZoom: 1,
				initialX: 300,
				initialY: 500,
				initialZoom: 1.5,
				bounds: true,
				boundsPadding: 0.4
			});
			setTimeout(() => {
				populateMapData();
			}, 1500);
		});
}

document.onreadystatechange = (e) => {
	if (document.readyState === 'complete') {
		loadMap(mapInst);
		const busses = usrData('get', 'bus');
		const noBus = busses.length;
		document.getElementById('js-bus')!.innerHTML = noBus;
	}
};

const fileEl = document.getElementById('fileSelect') as HTMLInputElement;
fileEl.addEventListener('change', () => {
	const files = fileEl.files!;
	for (const file of files) {
		readFile(file); // => script.ts
	}
});

window.onkeyup = (e: any) => {
	if (e.key === '/' || e.keyCode === 191) {
		document.getElementById('js-stnInput')!.focus();
	}
};

document.getElementById('js-menu')!.addEventListener('click', () => {
	document.getElementById('js-footer')!.classList.toggle('aside-active');
	document.getElementById('js-aside')!.classList.toggle('aside-out');
});

document.getElementById('js-stnInput')!.addEventListener('focus', (event) => {
	document.getElementById('js-footer')!.style.bottom = '';
	document.getElementById('js-footer')!.style.top = '10px';
});

document.getElementById('js-stnInput')!.addEventListener('blur', (event) => {
	document.getElementById('js-footer')!.style.top = '';
	document.getElementById('js-footer')!.style.bottom = '10px';
});

document.getElementById('js-stnInput')!.addEventListener('keyup', (e) => {
	if (e.key === 'Enter' || e.keyCode === 13) {
		const stnEl = <HTMLInputElement>document.getElementById('js-stnInput');
		if (newStation(stnEl.value)) {
			stnEl.value = '';
			popUp('Station added!', 'confirm');
		}
	}
});

document.getElementById('js-mapSwitch')!.addEventListener('click', () => {
	const icon = document.getElementById('js-mapSwitch')!;
	if (mapInst === 'tube') {
		icon.classList.remove('liz');
		mapInst = 'liz';
		icon.classList.add('tube');
	} else {
		icon.classList.remove('tube');
		mapInst = 'tube';
		icon.classList.add('liz');
	}
	loadMap(mapInst);
});

/* Dialogs */

const signUpDialog = document.getElementById('js-signup')! as HTMLDivElement;
const loginDialog = document.getElementById('js-login')! as HTMLDivElement;

<<<<<<< HEAD
=======
document.getElementById('js-user')!.addEventListener('click', () => {});

>>>>>>> 92fa10e (login start)
document.getElementById('js-loginButton')!.addEventListener('click', () => {
	signUpDialog.classList.remove('show');
	if (loginDialog.classList.contains('show')) {
		loginDialog.classList.remove('show');
	} else {
		loginDialog.classList.add('show');
	}
});

document.getElementById('js-signUpButton')!.addEventListener('click', () => {
	loginDialog.classList.remove('show');
	if (signUpDialog.classList.contains('show')) {
		signUpDialog.classList.remove('show');
	} else {
		signUpDialog.classList.add('show');
	}
});

document.getElementById('js-signupForm')!.addEventListener('submit', (e) => {
	e.preventDefault();
	const name = e.target[0].value,
		email = e.target[1].value,
		user = e.target[2].value,
		pass = e.target[3].value,
		stations = usrData('get', 'stations'),
		busses = usrData('get', 'bus');
	const userData = postUser('register', user, pass, email, name, stations, busses);
	// TODO: Do something with the returned data (i.e. populate user box etc...)
	// TODO: Close box on success.
});

document.getElementById('js-loginForm')!.addEventListener('submit', (e) => {
	e.preventDefault();
	const user = e.target[0].value,
		pass = e.target[1].value;
	postUser('login', user, pass);
	// TODO: Close box on success.
});

function postUser(
	type: string,
	user: string,
	pass: string,
	email: string = '',
	name: string = '',
	stations: Array<string> = [],
	bus: Array<string> = []
) {
	const f = fetch(type, {
		method: 'POST',
		credentials: 'same-origin',
		body: JSON.stringify({
			username: user,
			password: pass,
			email: email,
			name: name,
			stations: stations,
			bus: bus
		}),
		headers: {
			'Content-type': 'application/json; charset=UTF-8'
		}
	})
		.then((response) => response.text())
		.then((data) => {
			console.log(`[dom.ts | postUser] ${data}`);
			return JSON.parse(data);
		});
}

function newStation(input: string) {
	if (stations[input] !== undefined) {
		addStnsToMap(input);
		usrData('save', 'stations', input);
		updateLineSegs();
		return true;
	} else {
		popUp(`${input} doesn\'t exist.`, 'error');
		return false;
	}
}

function popUp(title: string, type: string, text: string = '', customColour?: string) {
	const types = ['info', 'confirm', 'error'];
	const el = document.createElement('div');
	el.classList.add('pop');
	if (!types.includes(type)) {
		el.style.cssText = `background:${customColour}`;
	} else {
		el.classList.add(type);
	}
	const head = document.createElement('h4');
	head.innerHTML = title;
	el.appendChild(head);
	if (text !== '') {
		const body = document.createElement('p');
		body.innerHTML = text;
		el.appendChild(body);
	}
	document.body.appendChild(el);
	setTimeout(() => {
		document.body.removeChild(el);
	}, 10000);
}

// @ts-ignore
const autoCompleteJS = new autoComplete({
	selector: '#js-stnInput',
	wrapper: true,
	threshold: 2,
	data: {
		src: [
			'Abbey Road',
			'Abbey Wood',
			'Acton Central',
			'Acton Mainline',
			'Acton Town',
			'Addiscombe',
			'Addington Village',
			'Aldgate',
			'Aldgate East',
			'All Saints',
			'Alperton',
			'Amersham',
			'Ampere Way',
			'Anerley',
			'Angel',
			'Archway',
			'Arena',
			'Arnos Grove',
			'Arsenal',
			'Avenue Road',
			'Baker Street',
			'Balham',
			'Bank',
			'Barbican',
			'Barking',
			'Barkingside',
			'Barons Court',
			'Battersea Power Station',
			'Bayswater',
			'Beckenham Junction',
			'Beckenham Road',
			'Beckton',
			'Beckton Park',
			'Becontree',
			'Beddington Lane',
			'Belgrave Walk',
			'Belsize Park',
			'Bermondsey',
			'Bethnal Green',
			'Birkbeck',
			'Blackfriars',
			'Blackhorse Road',
			'Blackhorse Lane',
			'Blackwall',
			'Bond Street',
			'Borough',
			'Boston Manor',
			'Bounds Green',
			'Bow Church',
			'Bow Road',
			'Brent Cross',
			'Brixton',
			'Brockley',
			'Bromley by Bow',
			'Brondesbury',
			'Brondesbury Park',
			'Brentwood',
			'Bruce Grove',
			'Buckhurst Hill',
			'Burnham',
			'Burnt Oak',
			'Bush Hill Park',
			'Bushey',
			'Caledonian Road',
			'Caledonian Road & Barnsbury',
			'Cambridge Heath',
			'Camden Road',
			'Camden Town',
			'Canada Water',
			'Canary Wharf',
			'Canning Town',
			'Cannon Street',
			'Canonbury',
			'Canons Park',
			'Carpenders Park',
			'Centrale',
			'Chadwell Heath',
			'Chalfont & Latimer',
			'Chalk Farm',
			'Chancery Lane',
			'Charing Cross',
			'Chesham',
			'Chesnut',
			'Chigwell',
			'Chingford',
			'Chiswick Park',
			'Chorleywood',
			'Church Stret',
			'Clapham Common',
			'Clapham High Steet',
			'Clapham Junction',
			'Clapham North',
			'Clapham South',
			'Clapton',
			'Cockfosters',
			'Colindale',
			'Colliers Wood',
			'Coombe Lane',
			'Covent Garden',
			'Crossharbour',
			'Crouch Hill',
			'Croxley',
			'Crystal Palace',
			'Custom House for ExCeL',
			'Cutty Sark for Maritime Greenwich',
			'Cyprus',
			'Dagenham East',
			'Dagenham Heathway',
			'Dalston Junction',
			'Dalston Kingsland',
			'Debden',
			'Denmark Hill',
			'Deptford Bridge',
			'Devons Road',
			'Dollis Hill',
			'Dundonald Road',
			'Ealing Broadway',
			'Ealing Common',
			"Earl's Court",
			'East Acton',
			'East Croydon',
			'East Finchley',
			'East Ham',
			'East India',
			'East Putney',
			'Eastcote',
			'Edgware',
			'Edgware Road (Bakerloo line)',
			'Edgware Road (District, Circle, H&C lines)',
			'Edmonton Green',
			'Elephant & Castle',
			'Elmers End',
			'Elm Park',
			'Elverson Road',
			'Embankment',
			'Emerson Park',
			'Emirates Greenwich Peninsula',
			'Emirates Royal Docks',
			'Enfield Town',
			'Epping',
			'Euston',
			'Euston Square',
			'Fairlop',
			'Farringdon',
			'Fieldway',
			'Finchley Central',
			'Finchley Road',
			'Finchley Road & Frognal',
			'Finsbury Park',
			'Forest Gate',
			'Forest Hill',
			'Fulham Broadway',
			'Gallions Reach',
			'Gants Hill',
			'George Street',
			'Gidea Park',
			'Gloucester Road',
			'Goldhawk Road',
			'Golders Green',
			'Goodge Street',
			'Goodmayes',
			'Gospel Oak',
			'Grange Hill',
			'Gravel Hill',
			'Great Portland Street',
			'Green Park',
			'Greenford',
			'Greenwich',
			'Gunnersbury',
			'Hackney Central',
			'Hackney Downs',
			'Hackney Wick',
			'Haggerston',
			'Hainault',
			'Hammersmith (Circle, H&C lines)',
			'Hammersmith (District, Piccadilly lines)',
			'Hampstead',
			'Hampstead Heath',
			'Hanger Lane',
			'Hanwell',
			'Harlesden',
			'Harringay Green Lanes',
			'Harrington Road',
			'Harold Wood',
			'Harrow & Wealdstone',
			'Harrow on the Hill',
			'Hatch End',
			'Hatton Cross',
			'Hayes & Harrlington',
			'Headstone Lane',
			'Heathrow Terminal 4',
			'Heathrow Terminal 5',
			'Heathrow Terminals 123',
			'Hendon Central',
			'Heron Quays',
			'Highams Park',
			'High Barnet',
			'High Street Kensington',
			'Highbury & Islington',
			'Highgate',
			'Hillingdon',
			'Holborn',
			'Holland Park',
			'Holloway Road',
			'Homerton',
			'Honor Oak Park',
			'Hornchurch',
			'Hounslow Central',
			'Hounslow East',
			'Hounslow West',
			'Hoxton',
			'Hyde Park Corner',
			'Ickenham',
			'Ilford',
			'Imperial Wharf',
			'Island Gardens',
			'Iver',
			'Kennington',
			'Kensal Green',
			'Kensal Rise',
			'Kensington (Olympia)',
			'Kentish Town',
			'Kentish Town West',
			'Kenton',
			'Kew Gardens',
			'Kilburn',
			'Kilburn Park',
			'Kilburn High Road',
			'King George V',
			'King Henrys Drive',
			'Kings Cross St Pancras',
			'Kings Cross St. Pancras',
			'Kingsbury',
			'Knightsbridge',
			'Ladbroke Grove',
			'Lambeth North',
			'Lancaster Gate',
			'Langley',
			'Langdon Park',
			'Latimer Road',
			'Lebanon Road',
			'Leicester Square',
			'Lewisham',
			'Leyton',
			'Leyton Midland Road',
			'Leytonstone',
			'Leytonstone High Road',
			'Limehouse',
			'Liverpool Street',
			'Lloyd Park',
			'London Bridge',
			'London City Airport',
			'London Fields',
			'Loughton',
			'Maida Vale',
			'Maidenhead',
			'Manor House',
			'Manor Park',
			'Mansion House',
			'Marble Arch',
			'Maryland',
			'Marylebone',
			'Merton Park',
			'Mile End',
			'Mill Hill East',
			'Mitcham',
			'Mitcham Junction',
			'Monument',
			'Moor Park',
			'Moorgate',
			'Morden',
			'Morden Road',
			'Mornington Crescent',
			'Mudchute',
			'Neasden',
			'Newbury Park',
			'New Addington',
			'New Cross',
			'New Cross Gate',
			'Nine Elms',
			'North Acton',
			'North Ealing',
			'North Greenwich',
			'North Harrow',
			'North Wembley',
			'Northfields',
			'Northolt',
			'Northwick Park',
			'Northwood',
			'Northwood Hills',
			'Norwood Junction',
			'Notting Hill Gate',
			'Oakwood',
			'Old Street',
			'Osterley',
			'Oval',
			'Oxford Circus',
			'Paddington',
			'Park Royal',
			'Parsons Green',
			'Peckham Rye',
			'Penge West',
			'Perivale',
			'Phipps Bridge',
			'Piccadilly Circus',
			'Pimlico',
			'Pinner',
			'Plaistow',
			'Pontoon Dock',
			'Poplar',
			'Preston Road',
			'Prince Regent',
			'Pudding Mill Lane',
			'Putney Bridge',
			"Queen's Park",
			"Queen's Road Peckham",
			'Queensbury',
			'Queensway',
			'Ravenscourt Park',
			'Rayners Lane',
			'Reading',
			'Rectory Road',
			'Redbridge',
			'Reeves Corner',
			"Regent's Park",
			'Richmond',
			'Rickmansworth',
			'Roding Valley',
			'Rotherhithe',
			'Romford',
			'Royal Albert',
			'Royal Oak',
			'Royal Victoria',
			'Ruislip',
			'Ruislip Gardens',
			'Ruislip Manor',
			'Russell Square',
			'Sandilands',
			'Seven Kings',
			'Seven Sisters',
			'Shadwell',
			'Shenfield',
			"Shepherd's Bush",
			"Shepherd's Bush (Central line)",
			"Shepherd's Bush Market",
			'Shoreditch High Street',
			'Silver Street',
			'Sloane Square',
			'Slough',
			'Snaresbrook',
			'South Acton',
			'South Ealing',
			'South Harrow',
			'South Hampstead',
			'South Kensington',
			'South Kenton',
			'South Tottenham',
			'South Quay',
			'South Ruislip',
			'South Wimbledon',
			'South Woodford',
			'Southall',
			'Southbury',
			'Southfields',
			'Southgate',
			'Southwark',
			"St John's Wood",
			"St Paul's",
			"St James' Park",
			"St James' Street",
			'Stamford Brook',
			'Stamford Hill',
			'Stanmore',
			'Star Lane',
			'Stepney Green',
			'Stockwell',
			'Stoke Newington',
			'Stonebridge Park',
			'Stratford',
			'Stratford High Street',
			'Stratford International',
			'Sudbury Hill',
			'Sudbury Town',
			'Surrey Quays',
			'Swiss Cottage',
			'Sydenham',
			'Taplow',
			'Temple',
			'Theobalds Grove',
			'Therapia Lane',
			'Theydon Bois',
			'Tooting Bec',
			'Tooting Broadway',
			'Tottenham Court Road',
			'Tottenham Hale',
			'Totteridge & Whetstone',
			'Tower Gateway',
			'Tower Hill',
			'Tufnell Park',
			'Turkey Street',
			'Turnham Green',
			'Turnpike Lane',
			'Twyford',
			'Upminster',
			'Upminster Bridge',
			'Upney',
			'Upper Holloway',
			'Upton Park',
			'Uxbridge',
			'Vauxhall',
			'Victoria',
			'Waddon Marsh',
			'Walthamstow Central',
			"Walthamstow Queen's Road",
			'Wandle Park',
			'Wandsworth Road',
			'Wanstead',
			'Wantead Park',
			'Wapping',
			'Warren Street',
			'Warwick Avenue',
			'Waterloo',
			'Watford',
			'Watford High Street',
			'Watford Junction',
			'Wellesley Road',
			'Wembley Central',
			'Wembley Park',
			'Westbourne Park',
			'West Acton',
			'West Brompton',
			'West Croydon',
			'West Drayton',
			'West Ealing',
			'West Finchley',
			'West Ham',
			'West Hampstead',
			'West Harrow',
			'West India Quay',
			'West Kensington',
			'West Ruislip',
			'West Silvertown',
			'Westferry',
			'Westminster',
			'White City',
			'Whitechapel',
			'White Heart Lane',
			'Willesden Green',
			'Willesden Junction',
			'Wimbledon',
			'Wimbledon Park',
			'Wood Green',
			'Woodford',
			'Woodgrange Park',
			'Wood Lane',
			'Woodside',
			'Woodside Park',
			'Wood Street',
			'Woolwich Arsenal',
			'Woolwich'
		],
		cache: true
	},
	resultItem: {
		highlight: true,
		id: 'resultItem'
	},
	resultsList: {
		id: 'resultList',
		maxResults: 3,
		tabSelect: true,
		element: (list: any, data: any) => {
			if (!data.results.length) {
				const message = document.createElement('div');
				message.setAttribute('class', 'no_result');
				message.innerHTML = `<span>Found No Results for "${data.query}"</span>`;
				list.prepend(message);
			}
		},
		noResults: true
	},
	events: {
		input: {
			selection: (event: any) => {
				let selection: string = event.detail.selection.value;
				selection = selection.replaceAll(/&amp;/g, '&');
				autoCompleteJS.input.value = selection;
				newStation(selection);
				popUp('Station added!', 'confirm');
			}
		}
	}
});
