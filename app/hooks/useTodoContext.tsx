import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import Store from 'electron-store';
import { Todo } from '../types';

const store = new Store();
const dateFormatter = (timestamp: number) =>
  dayjs(timestamp).format('MM-D-YYYY');
const STORE_KEY_BY_MONTH = `todo.${dayjs().format('YYYY/MM')}`;
const STORE_KEY_BY_BACKLOGS = 'todo.backlogs';

export interface TodoContext {
  monthTodos: Todo[];
  todayTodos: Todo[];
  handleRemove: (timestamp: number) => void;
  handleToggleTodo: (timestamp: number) => void;
  handleSubmit: (value: string) => void;

  // Backlog
  handleSubmitBacklog: (value: string) => void;
  backlogTodos: Todo[];
}

export default function useTodoContext(): TodoContext {
  const [monthTodos, setMonthTodos] = useState<Todo[]>([]);
  const [backlogTodos, setBacklogTodos] = useState<Todo[]>([]);
  const todayTodos = monthTodos.filter(todo => {
    return dateFormatter(todo.timestamp) === dateFormatter(+new Date());
  });

  useEffect(() => {
    const todosFromStorage = store.get(STORE_KEY_BY_MONTH) ?? [];
    const backlogTodosFromStorage = store.get(STORE_KEY_BY_BACKLOGS) ?? [];
    setMonthTodos(todosFromStorage);
    setBacklogTodos(backlogTodosFromStorage);
    console.log('몇번?');
    // store.delete(STORE_KEY_BY_MONTH); // 리셋하고 싶다면!
  }, []);

  const handleRemove = (timestamp: number) => {
    const updatedMonthTodos: Todo[] = monthTodos.filter(
      item => item.timestamp !== timestamp
    );
    setMonthTodos(updatedMonthTodos);
    store.set(STORE_KEY_BY_MONTH, updatedMonthTodos);
  };

  const handleToggleTodo = (timestamp: number) => {
    const updatedMonthTodos: Todo[] = monthTodos.map(item => {
      if (item.timestamp === timestamp) {
        const updatedItem = item;
        updatedItem.isDone = !item.isDone;
        return updatedItem;
      }
      return item;
    });

    setMonthTodos(updatedMonthTodos);
    store.set(STORE_KEY_BY_MONTH, updatedMonthTodos);
  };

  const handleSubmit = (value: string) => {
    const updatedMonthTodos: Todo[] = [
      {
        timestamp: +new Date(),
        text: value,
        isDone: false
      },
      ...monthTodos
    ];
    setMonthTodos(updatedMonthTodos);
    store.set(STORE_KEY_BY_MONTH, updatedMonthTodos);
  };

  const handleSubmitBacklog = (value: string) => {
    const updatedBacklogTodos: Todo[] = [
      {
        timestamp: +new Date(),
        text: value,
        isDone: false
      },
      ...backlogTodos
    ];
    setBacklogTodos(updatedBacklogTodos);
    store.set(STORE_KEY_BY_BACKLOGS, updatedBacklogTodos);
  };

  return {
    monthTodos,
    todayTodos,
    handleRemove,
    handleToggleTodo,
    handleSubmit,

    // Backlog
    handleSubmitBacklog,
    backlogTodos
  };
}