import {
  BatchWriteCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  CLICK_EVENTS_TABLE,
  docClient,
  LINKS_TABLE,
} from "../db/dynamodb.js";
import { clickEventExpiresAt, linkExpiresAt } from "../utils/ttl.js";

function nowIso() {
  return new Date().toISOString();
}

export async function save(code, url) {
  await docClient.send(
    new PutCommand({
      TableName: LINKS_TABLE,
      Item: {
        code,
        original_url: url,
        clicks: 0,
        created_at: nowIso(),
        expires_at: linkExpiresAt(),
      },
    })
  );
}

export async function findByCode(code) {
  const result = await docClient.send(
    new GetCommand({
      TableName: LINKS_TABLE,
      Key: { code },
    })
  );
  return result.Item?.original_url ?? null;
}

export async function hasCode(code) {
  const result = await docClient.send(
    new GetCommand({
      TableName: LINKS_TABLE,
      Key: { code },
      ProjectionExpression: "code",
    })
  );
  return result.Item !== undefined;
}

export async function incrementClicks(code) {
  await docClient.send(
    new UpdateCommand({
      TableName: LINKS_TABLE,
      Key: { code },
      UpdateExpression: "ADD clicks :one SET last_clicked_at = :now",
      ExpressionAttributeValues: {
        ":one": 1,
        ":now": nowIso(),
      },
    })
  );
}

export async function logClick(code, visitorHash) {
  await docClient.send(
    new PutCommand({
      TableName: CLICK_EVENTS_TABLE,
      Item: {
        code,
        clicked_at: nowIso(),
        visitor_hash: visitorHash,
        expires_at: clickEventExpiresAt(),
      },
    })
  );
}

export async function getStats(code) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: CLICK_EVENTS_TABLE,
      KeyConditionExpression: "code = :code",
      ExpressionAttributeValues: { ":code": code },
    })
  );

  const events = result.Items ?? [];
  const visitors = new Set();
  const byDay = new Map();
  let lastClickedAt = null;

  for (const event of events) {
    visitors.add(event.visitor_hash);
    const day = event.clicked_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
    if (!lastClickedAt || event.clicked_at > lastClickedAt) {
      lastClickedAt = event.clicked_at;
    }
  }

  const clicksByDay = [...byDay.entries()]
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => b.day.localeCompare(a.day));

  return {
    clicks: events.length,
    uniqueVisitors: visitors.size,
    lastClickedAt,
    clicksByDay,
  };
}

export async function deleteLink(code) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: CLICK_EVENTS_TABLE,
      KeyConditionExpression: "code = :code",
      ExpressionAttributeValues: { ":code": code },
      ProjectionExpression: "code, clicked_at",
    })
  );

  const events = result.Items ?? [];
  for (let i = 0; i < events.length; i += 25) {
    const chunk = events.slice(i, i + 25);
    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [CLICK_EVENTS_TABLE]: chunk.map((event) => ({
            DeleteRequest: {
              Key: { code: event.code, clicked_at: event.clicked_at },
            },
          })),
        },
      })
    );
  }

  const deleted = await docClient.send(
    new DeleteCommand({
      TableName: LINKS_TABLE,
      Key: { code },
      ReturnValues: "ALL_OLD",
    })
  );

  return deleted.Attributes !== undefined;
}
