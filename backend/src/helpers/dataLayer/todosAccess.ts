import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../../utils/logger';
import { TodoItem } from '../../models/TodoItem';
import { TodoUpdate } from '../../models/TodoUpdate';
import {AttachmentUtils} from "../fileStorage/attachmentUtils";

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// Implement the dataLayer logic
export class TodosAccess {
    private readonly todosTable: string = process.env.TODOS_TABLE;
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET;

    private docClient: DocumentClient;

    constructor() {
        this.docClient = new XAWS.DynamoDB.DocumentClient();
    }

    public async getTodos(userId: string) : Promise<TodoItem[]> {
        logger.info('Getting all todo items')

        const todos = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        return todos.Items as TodoItem[];
    }

    public async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info("Start add a new todo")

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise();

        logger.info(`todo ${todo.name} is added`);

        return todo as TodoItem;
    }

    public async updateTodo(userId: string, todoId: string, todo: TodoUpdate) {
        logger.info(`Updating a todo item: ${todoId}`)

        const params = {
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: "set #name = :name, #dueDate = :dueDate, #done = :done",
            ExpressionAttributeNames: {
                "#name": "name",
                "#dueDate": "dueDate",
                "#done": "done"
            },
            ExpressionAttributeValues: {
                ":name": todo.name,
                ":dueDate": todo.dueDate,
                ":done": todo.done
            },
            ReturnValues: "ALL_NEW"
        };
        const result = await this.docClient.update(params).promise();

        return result.Attributes as TodoItem;
    }

    public async deleteTodo(userId: string, todoId: string) {
        logger.info(`Deleting a todo item: ${todoId}`)

        const params = {
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        };

        return await this.docClient.delete(params).promise();
    }

    public async createAttachmentUrl(userId: string, todoId: string) {
        logger.info(`Creating attachment url: ${todoId}`)

        const attachmentUtil = new AttachmentUtils();
        const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`;

        const params = {
            TableName: this.todosTable,
            Key: { userId, todoId },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ":attachmentUrl": attachmentUrl
            }
        };

        await this.docClient.update(params).promise();

        return await attachmentUtil.createAttachmentUrl(todoId);
    }

    public async getTodoItem(userId: string, todoId: string) {
        logger.info(`Get TODO item: ${todoId}`);
        const params = {
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        };
        const result = await this.docClient.get(params).promise();
        return result.Item as TodoItem;
    }
}