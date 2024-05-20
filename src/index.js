const fs = require("fs");
const path = require("path");
const utils = require("util");
const puppeteer = require("puppeteer");
const hb = require("handlebars");
const readFile = utils.promisify(fs.readFile);
const chromium = require('@sparticuz/chromium');

// Loading HTML template
async function getTemplateHtml(htmlTemplatePath) {
  let templatePath;
  try {
    templatePath = path.resolve(htmlTemplatePath);
    return await readFile(templatePath, "utf8");
  } catch (err) {
    return Promise.reject("Could not load html template");
  }
}

// Generating PDF
async function generatePDF(htmlTemplatePath, data = {}, isPublish = false, pdfFormatDetails = {}) {
  let PDF;
  await getTemplateHtml(htmlTemplatePath).then(async (res) => {

    hb.registerHelper('ifCond', function (v1, operator, v2, options) {
      switch (operator) {
        case '==':
          return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
          return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
          return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
          return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
          return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
          return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
          return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
          return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
          return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    });

    hb.registerHelper('Operate', function (v1, operator, v2) {
      switch (operator) {
        case '+':
          return Number(v1) + Number(v2);
        case '-':
          return Number(v1) - Number(v2);
        case '*':
          return Number(v1) * Number(v2);
        case '%':
          return Number(v1) % Number(v2);
        case '/':
          return Number(v1) / Number(v2);
        default:
          return "";
      }
    });

    hb.registerHelper("setVar", function (varName, varValue, options) {
      options.data.root[varName] = varValue;
    });

    // Now we have the html code of our template in res object
    // you can check by logging it on console
    const template = hb.compile(res);
    const result = await template(data);

    let browser = "";
    if(isPublish == true)
    {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      })      
    } else {
      browser = await puppeteer.launch({
        headless: 'true'
      });
    }		

    const page = await browser.newPage();
    await page.setContent(result);
    PDF = await page.pdf(pdfFormatDetails);
    if(isPublish == false)
    {
      await browser.close();
    }  
  });
  return PDF;
}

module.exports = { generatePDF };
