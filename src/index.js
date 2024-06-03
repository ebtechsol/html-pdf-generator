const fs = require("fs");
const path = require("path");
const utils = require("util");
const puppeteer = require("puppeteer");
const hb = require("handlebars");
const readFile = utils.promisify(fs.readFile);
const chromium = require('@sparticuz/chromium');
const AWS = require("aws-sdk")
const s3 = new AWS.S3();

// Loading HTML template
async function getTemplateHtml(htmlTemplatePath, isPublish) {
  let templatePath;
  try {
    if(isPublish == true) { // s3 bucket
      const S3URLArray = htmlTemplatePath.split('//')[1];
      const bucketName = S3URLArray.split('/', 1)[0];
      const keyName = S3URLArray.split('/').slice(1).join('/');
      var params = { Bucket : bucketName, Key : keyName }
      const s3Object = await s3.getObject(params).promise();
      return s3Object.Body.toString();
    } else {
      templatePath = path.resolve(htmlTemplatePath);
      return await readFile(templatePath, "utf8");
    }
  } catch (err) {
    return Promise.reject("Could not load html template");
  }
}

// Generating PDF
async function generatePDF(htmlTemplatePath, data = {}, isPublish = false, pdfFormatDetails = {}) {
  let PDF;
  await getTemplateHtml(htmlTemplatePath, isPublish).then(async (res) => {

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
