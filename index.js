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
	const {subCategoryList} = $category('div#mw-subcategories div.mw-category').extract({subCategoryList:['li']});
	const subCategories = []
	for (const subCategory of subCategoryList) {
		if (subCategory.trim().match(/\d+/g)) {
			let data = {
				title: subCategory.slice(0, subCategory.indexOf('(')).trim(),
				numberOfCategories: subCategory.trim().match(/\d+/g)[0],
				numberOfPages: subCategory.trim().match(/\d+/g)[1]
			};
			subCategories.push(data);
		}
	}
	console.log(subCategoryList);
	if (subCategories.length == 0) return null;
	return randomElement(subCategories);
}

function getRandomSubCategoryLinks($category){

}


function getRandomPage($category) {
	const pages = [];
	const {pageList} = $category('div#mw-pages div.mw-category').extract({pageList:['li']});
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

		const categoryRes = await axios.get('https://en.wikipedia.org/' + randomCategory.href, { headers: { 'User-Agent': 'Express' } });
		const $category = cheerio.load(categoryRes.data);

		console.log(randomCategory);
		console.log(getRandomPage($category))
		console.log(getRandomSubCategory($category))

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
