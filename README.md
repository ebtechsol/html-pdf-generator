# HTML PDF Generator

The simplest way to generate static and dynamic PDF in NodeJS. Converts HTML(with `.hbs` extension) template into
PDF.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)]

## Features

- Generate PDF from HTML file.
- Generate dynamic PDFs
- Add custom header and footer to PDF

## Installation

To use HTML PDF Generator in your project, run:

```bash
  npm install html-epdf-generator
```

## How to Use

#### Step 1 - Add required packages and generate a PDF

```js
const express = require("express");
const pdfGenerator = require("html-epdf-generators");

const app = express();

app.get("", async (req, res) => {
  var PDF = await pdfGenerator.generatePdf("pdfHtmlFormat.hbs");
  res.contentType("application/pdf");
  res.status(200).send(PDF);
});
```

`generatePdf()` syntax and parameters

```js
generatePdf(
  templatePath, //<string>
  data, //<object>   Pass data to template(optional)
  options //<object>   PDF format options(optional)
);
```

#### Step 2 - Create your HTML Template (save the template with .hbs extension instead of .html)

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>
```

## Render dynamic data in template and PDF format options

```js
const express = require("express");
const pdfGenerator = require("html-epdf-generator");

const app = express();

app.get("", async (req, res) => {

  var students = {
      {
          id: 1,
          name: "Kazim",
          age: 21
      },
      {
          id: 2,
          name: "Ahmad",
          age: 20
      },
      {
          id: 3,
          name: "Mansoor",
          age: 24
      }
  }

  let options = {
    displayHeaderFooter: true,
    format: "A4",
    headerTemplate: `<h3> Header </h3>`,
    footerTemplate: `<h3> Copyright 2024 </h3>`,
    margin: { top: "80px", bottom: "100px" },
  };

  let PDF = await pdfGenerator.generatePdf("template.hbs", students, options);
  res.contentType("application/pdf");
  res.status(200).send(PDF);
});
```

[Read more on options]()

### template for the above example (save the template with .hbs extension)

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <h1>Student List</h1>
    <ul>
      {{#each students}}
      <li>Name: {{this.name}}</li>
      <li>Age: {{this.age}}</li>
      <br />
      {{/each}}
    </ul>
  </body>
</html>
```


## Contributing

Feel free to contribute. Your contribution will be appreciated.

## License

html-epdf-generator is [MIT licensed].
