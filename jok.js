import * as cheerio from 'cheerio';

const $ = cheerio.load(`
    <div class="mw-category">
        <div class="mw-category-group">
            <h3>0–9</h3>
            <ul>
                <li>
                    <a href="/wiki/3dvia" title="3dvia">
                        3dvia
                    </a>
                </li>
            </ul>    
        </div>
        <div class="mw-category-group">
            <h3>0–9</h3>
            <ul>
                <li>
                    <a href="/wiki/3dvia" title="3dvia">
                        3dvia
                    </a>
                </li>
                <li>
                    <a href="/wiki/3dvia" title="3dvia">
                        3dvia
                    </a>
                </li>
            </ul>    
        </div>
    </div>
    
`);

const data = $.extract({
    href: ['li'],
});

console.log(data)