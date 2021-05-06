const axios = require("axios").default;
const Converter = require("openapi-to-postmanv2");
let response;
let openapi;
let specData;
let convertedSpec;

exports.handler = async (event) => {
  openapi = event.queryStringParameters.openapi;
  try {
    specData = await axios.get(openapi);
    if (specData) {
      convertedSpec = await convertToCollectionFromOpenApiSpec(specData.data);
    }
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

async function convertToCollectionFromOpenApiSpec(spec) {
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
