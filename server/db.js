import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  waitUntilTableExists,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
const TableName = process.env.DYNAMODB_TABLE || "HangmanPlayers";
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
  credentials: { accessKeyId: "local", secretAccessKey: "local" },
});
const db = DynamoDBDocumentClient.from(client);
export async function initialize() {
  try {
    await client.send(new DescribeTableCommand({ TableName }));
  } catch (error) {
    if (error.name !== "ResourceNotFoundException") throw error;
    try {
      await client.send(
        new CreateTableCommand({
          TableName,
          BillingMode: "PAY_PER_REQUEST",
          KeySchema: [{ AttributeName: "playerID", KeyType: "HASH" }],
          AttributeDefinitions: [
            { AttributeName: "playerID", AttributeType: "S" },
            { AttributeName: "nameKey", AttributeType: "S" },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: "playerName-index",
              KeySchema: [{ AttributeName: "nameKey", KeyType: "HASH" }],
              Projection: { ProjectionType: "ALL" },
            },
          ],
        }),
      );
    } catch (e) {
      if (e.name !== "ResourceInUseException") throw e;
    }
  }
  await waitUntilTableExists({ client, maxWaitTime: 60 }, { TableName });
}
export const store = {
  async find(nameKey) {
    const players = [];
    let ExclusiveStartKey;
    do {
      const result = await db.send(
        new QueryCommand({
          TableName,
          IndexName: "playerName-index",
          KeyConditionExpression: "nameKey = :name",
          ExpressionAttributeValues: { ":name": nameKey },
          ExclusiveStartKey,
        }),
      );
      players.push(...result.Items);
      ExclusiveStartKey = result.LastEvaluatedKey;
    } while (ExclusiveStartKey);
    return players;
  },
  async create(player) {
    await db.send(
      new PutCommand({
        TableName,
        Item: player,
        ConditionExpression: "attribute_not_exists(playerID)",
      }),
    );
    return player;
  },
  async update(playerID, { wins, losses, version }) {
    const result = await db.send(
      new UpdateCommand({
        TableName,
        Key: { playerID },
        UpdateExpression: "SET wins = :w, losses = :l, version = :next",
        ConditionExpression:
          "attribute_exists(playerID) AND version = :v AND ((wins = :pw AND losses = :l) OR (wins = :w AND losses = :pl))",
        ExpressionAttributeValues: {
          ":w": wins,
          ":l": losses,
          ":v": version,
          ":next": version + 1,
          ":pw": wins - 1,
          ":pl": losses - 1,
        },
        ReturnValues: "ALL_NEW",
      }),
    );
    return result.Attributes;
  },
};
