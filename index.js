import axios from 'axios';
import * as cheerio from 'cheerio';
import { randomInt } from 'crypto';

let categoryLinks = [];

let website = 'https://en.wikipedia.org/wiki/Wikipedia:Contents/Categories#Technology_and_applied_sciences';

function randomElement(arr) {
	let rndIdx = randomInt(arr.length);
	return arr[rndIdx];
}

function getRandomSubCategory($category) {
	const { subCategoryList, links } = $category('div#mw-subcategories div.mw-category').extract({
		subCategoryList: ['li'], links: [{
			selector: 'a',
			value: 'href'
		}]
	});
	const subCategories = []
	subCategoryList.map((subCategory, i) => {
		const sc = {};
		sc.title = subCategory.slice(0, subCategory.indexOf('(')).trim();
		sc.href = links[i];
		subCategories.push(sc);
	})
	if (subCategories.length == 0) return null;
	return randomElement(subCategories);
}



function getRandomPage($category) {
	const pages = [];
	const { pageList } = $category('div#mw-pages div.mw-category').extract({ pageList: ['li'] });
	for (const page of pageList) {
		if (page.trim()) {
			const data = {
				name: page
			};
			pages.push(data);
		}
	}
	if (pages.length == 0) return null;
	return randomElement(pages);
}

try {
	axios(website, { headers: { 'User-Agent': 'Express' } }).then(async (res) => {
		const data = res.data;
		const $ = cheerio.load(data);

		const $ul = $('.contentsPage :nth-child(29) :nth-child(6) ul');

		$ul.find('a').map((_, el) => {
			categoryLinks.push({ href: $(el).attr('href'), title: $(el).text() });
		})

		let randomCategory = randomElement(categoryLinks)
		console.log(randomCategory);
		const categoryRes = await axios.get('https://en.wikipedia.org' + randomCategory.href, { headers: { 'User-Agent': 'Express' } });
		const $category = cheerio.load(categoryRes.data);

		console.log(getRandomPage($category))
		const subCatInfo = getRandomSubCategory($category)
		const subCategoryRes = await axios.get('https://en.wikipedia.org' + subCatInfo.href, { headers: { 'User-Agent': 'Express' } });
		const $subCategoryRes = cheerio.load(subCategoryRes.data);
		console.log(subCatInfo);

		console.log(subCatInfo.title);
		console.log(getRandomSubCategory($subCategoryRes));
		// for (const link of categoryLinks) {
		// 	const res = await axios.get('https://en.wikipedia.org/' + link, { headers: { 'User-Agent': 'Express' } });
		// 	const $ = cheerio.load(res.data);
		// 	console.log($('div.mw-category.mw-category-columns').text())
		// 	await delay(500);
		// }

	});
} catch (error) {
	console.log(error, error.message);
}
