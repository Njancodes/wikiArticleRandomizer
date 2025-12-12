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
		sc.type = 'sub-category'
		sc.title = subCategory.slice(0, subCategory.indexOf('(')).trim();
		sc.href = links[i];
		subCategories.push(sc);
	})
	if (subCategories.length == 0) return null;
	return randomElement(subCategories);
}

async function randomWikiWalk($scategory) {
	const flip = randomInt(2);
	let pageObj, subcategoryObj;
	subcategoryObj = getRandomSubCategory($scategory);
	pageObj = getRandomPage($scategory);

	if (flip == 0 && pageObj || !subcategoryObj) {
		return new Promise((resolve, reject) => {
			resolve(pageObj);
		})
	}
	const subCategoryRes = await axios.get('https://en.wikipedia.org' + subcategoryObj.href, { headers: { 'User-Agent': 'Express' } });
	const $subCategoryRes = cheerio.load(subCategoryRes.data);

	return randomWikiWalk($subCategoryRes);
}

function getRandomPage($category) {
	const pages = [];
	const { pageList, links } = $category('div#mw-pages div.mw-category').extract({ pageList: ['li'], links: [{ selector: 'li a', value: 'href' }] });
	pageList.map((page, i) => {
		const p = {};
		p.type = 'page'
		p.title = page.trim();
		p.href = links[i];
		pages.push(p);
	})
	if (pages.length == 0) return null;
	return randomElement(pages);
}

try {
	axios(website, { headers: { 'User-Agent': 'Express' } }).then(async (res) => {
		const data = res.data;
		const $ = cheerio.load(data);

		const $ul = $(`.contentsPage :nth-child(29) :nth-child(6) ul`);

		const $categories = $(`.contentsPage #Technology_and_applied_sciences `).next().children('.hlist')

		$categories.each((_, el) => {
			const firstCategory = $(el).children('ul').children('')
			if ($(firstCategory).find('i').html()) {
				return;
			}
			const categoryName = $(firstCategory).children(':first').text().toLowerCase();
			if (categoryName == process.argv[2]) {
				$(firstCategory).parent().children().find('a').map((_, el) => {
					categoryLinks.push({ href: $(el).attr('href'), title: $(el).text() });
				})
			}
		})

		let randomCategory = randomElement(categoryLinks)
		const categoryRes = await axios.get('https://en.wikipedia.org' + randomCategory.href, { headers: { 'User-Agent': 'Express' } });
		const $category = cheerio.load(categoryRes.data);


		const resultant = await randomWikiWalk($category)
		console.log(randomCategory);
		console.log('https://en.wikipedia.org' + resultant.href);

	});
} catch (error) {
	console.log(error, error.message);
}
