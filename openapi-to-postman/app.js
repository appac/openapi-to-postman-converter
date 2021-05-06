const https = require("https");
const Converter = require("openapi-to-postmanv2");
let response;
let openapi;
let specData;
let convertedSpec;

exports.handler = async (event) => {
  openapi = event.queryStringParameters.openapi;
  try {
    specData = await getOpenApiSpecFromUrl(openapi);
    convertedSpec = await convertToCollectionFromOpenApiSpec(specData);
  } catch (err) {
    response = {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        reason: err.message,
      }),
    };
  }
  response = {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(convertedSpec),
  };
  return response;
};

function getOpenApiSpecFromUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (e) => {
        reject(Error(e));
      });
  });
}

function convertToCollectionFromOpenApiSpec(spec) {
  return new Promise((resolve, reject) => {
    Converter.convert(
      {
        type: "string",
        data: spec,
      },
      {},
      (err, result) => {
        if (err) {
          reject("Error converting spec: ", err.message);
        } else if (!result.result) {
          reject("Spec conversion failed: ", result.reason);
        }
        resolve(result.output[0].data);
      }
    );
  });
}
