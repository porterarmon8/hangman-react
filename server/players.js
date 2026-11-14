import { randomUUID } from 'node:crypto';
import {
  CreateTableCommand, DescribeTableCommand, DynamoDBClient, GetItemCommand,
  PutItemCommand, QueryCommand, TransactWriteItemsCommand, waitUntilTableExists,
} from '@aws-sdk/client-dynamodb';

const table = 'HangmanPlayers';
const nameIndex = 'PlayerNameIndex';
const db = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://127.0.0.1:8000',
  region: 'us-east-1',
  credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
});

export async function initializePlayers() {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await db.send(new DescribeTableCommand({ TableName: table }));
      break;
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        try {
          await db.send(new CreateTableCommand({
            TableName: table,
            BillingMode: 'PAY_PER_REQUEST',
            AttributeDefinitions: [
              { AttributeName: 'playerID', AttributeType: 'S' },
              { AttributeName: 'nameKey', AttributeType: 'S' },
            ],
            KeySchema: [{ AttributeName: 'playerID', KeyType: 'HASH' }],
            GlobalSecondaryIndexes: [{
              IndexName: nameIndex,
              KeySchema: [{ AttributeName: 'nameKey', KeyType: 'HASH' }],
              Projection: { ProjectionType: 'ALL' },
            }],
          }));
        } catch (createError) {
          if (createError.name !== 'ResourceInUseException') throw createError;
        }
        break;
      }
      if (attempt === 30 || !['ECONNREFUSED', 'ECONNRESET', 'EAI_AGAIN', 'ENOTFOUND'].includes(error.code)) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  await waitUntilTableExists({ client: db, maxWaitTime: 30 }, { TableName: table });
}

function readPlayer(item) {
  return {
    playerID: item.playerID.S,
    playerName: item.playerName.S,
    wins: Number(item.wins.N),
    losses: Number(item.losses.N),
  };
}

async function getPlayer(playerID) {
  const { Item } = await db.send(new GetItemCommand({
    TableName: table,
    Key: { playerID: { S: playerID } },
    ConsistentRead: true,
  }));
  return Item ? readPlayer(Item) : null;
}

export const players = {
  async find(playerName) {
    const matches = [];
    let startKey;
    do {
      const page = await db.send(new QueryCommand({
        TableName: table,
        IndexName: nameIndex,
        KeyConditionExpression: 'nameKey = :name',
        ExpressionAttributeValues: { ':name': { S: playerName.toLowerCase() } },
        ExclusiveStartKey: startKey,
      }));
      matches.push(...(page.Items || []).map(readPlayer));
      startKey = page.LastEvaluatedKey;
    } while (startKey);
    return matches;
  },

  async create(playerName) {
    const item = {
      playerID: { S: randomUUID() },
      playerName: { S: playerName },
      nameKey: { S: playerName.toLowerCase() },
      wins: { N: '0' },
      losses: { N: '0' },
    };
    await db.send(new PutItemCommand({
      TableName: table,
      Item: item,
      ConditionExpression: 'attribute_not_exists(playerID)',
    }));
    return readPlayer(item);
  },

  async record(playerID, gameID, outcome) {
    const roundKey = { playerID: { S: `round#${playerID}#${gameID}` } };
    try {
      await db.send(new TransactWriteItemsCommand({
        TransactItems: [
          { Put: {
            TableName: table,
            Item: roundKey,
            ConditionExpression: 'attribute_not_exists(playerID)',
          } },
          { Update: {
            TableName: table,
            Key: { playerID: { S: playerID } },
            ConditionExpression: 'attribute_exists(playerID)',
            UpdateExpression: 'ADD #total :one',
            ExpressionAttributeNames: { '#total': outcome === 'won' ? 'wins' : 'losses' },
            ExpressionAttributeValues: { ':one': { N: '1' } },
          } },
        ],
      }));
    } catch (error) {
      if (error.name !== 'TransactionCanceledException') throw error;
      const reasons = error.CancellationReasons || [];
      if (reasons[1]?.Code === 'ConditionalCheckFailed') return null;
      if (reasons[0]?.Code !== 'ConditionalCheckFailed') {
        const { Item } = await db.send(new GetItemCommand({
          TableName: table, Key: roundKey, ConsistentRead: true,
        }));
        if (!Item) {
          if (!(await getPlayer(playerID))) return null;
          throw error;
        }
      }
    }
    return getPlayer(playerID);
  },
};
