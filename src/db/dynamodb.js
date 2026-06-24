import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const LINKS_TABLE = process.env.LINKS_TABLE || "links";
export const CLICK_EVENTS_TABLE = process.env.CLICK_EVENTS_TABLE || "click_events";

const clientConfig = {
  region: process.env.AWS_REGION || "us-east-1",
};

if (process.env.DYNAMODB_ENDPOINT) {
  clientConfig.endpoint = process.env.DYNAMODB_ENDPOINT;
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "local",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "local",
  };
}

const client = new DynamoDBClient(clientConfig);

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

async function tableExists(tableName) {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    if (error.name === "ResourceNotFoundException") {
      return false;
    }
    throw error;
  }
}

async function waitForTable(tableName) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (await tableExists(tableName)) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Table ${tableName} was not ready in time`);
}

export async function ensureTables() {
  if (!(await tableExists(LINKS_TABLE))) {
    await client.send(
      new CreateTableCommand({
        TableName: LINKS_TABLE,
        AttributeDefinitions: [{ AttributeName: "code", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "code", KeyType: "HASH" }],
        BillingMode: "PAY_PER_REQUEST",
      })
    );
    await waitForTable(LINKS_TABLE);
  }

  if (!(await tableExists(CLICK_EVENTS_TABLE))) {
    await client.send(
      new CreateTableCommand({
        TableName: CLICK_EVENTS_TABLE,
        AttributeDefinitions: [
          { AttributeName: "code", AttributeType: "S" },
          { AttributeName: "clicked_at", AttributeType: "S" },
        ],
        KeySchema: [
          { AttributeName: "code", KeyType: "HASH" },
          { AttributeName: "clicked_at", KeyType: "RANGE" },
        ],
        BillingMode: "PAY_PER_REQUEST",
      })
    );
    await waitForTable(CLICK_EVENTS_TABLE);
  }
}
