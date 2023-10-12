import { TodosAccess } from '../dataLayer/todosAccess';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { createLogger } from '../../utils/logger';
import * as uuid from 'uuid';

const logger = createLogger("businessLogic");
const todoAccess = new TodosAccess();
// Implement businessLogic
export const getTodosForUser = async (userId: string) => {
    return await todoAccess.getTodos(userId);
}

export const createTodo = async (userId: string, todo: CreateTodoRequest) => {
    const todoId = uuid.v4();
    logger.info(`Creating todo ${todoId}`)
    return await todoAccess.createTodo({
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: null,
        ...todo
    });
}

export const updateTodo = async (userId: string, todoId: string, request: UpdateTodoRequest) => {
    await todoAccess.updateTodo(userId, todoId, request);
}

export const deleteTodo = async (userId: string, todoId: string) => {
    await todoAccess.deleteTodo(userId, todoId);
}

export const createAttachmentUrl = async (userId: string, todoId: string) => {
    return await todoAccess.createAttachmentUrl(userId, todoId);
}