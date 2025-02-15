import { createStore } from "../src/core/store/createStore";
import { logger, thunk } from "../src/core/store/middleware";
import { createSelector } from "../src/core/store/selector";
import { ActionCreator, Reducer } from "../src/core/store/types";

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoState {
  todos: TodoItem[];
  filter: "all" | "active" | "completed";
}

// Actions
const ADD_TODO = "ADD_TODO";
const TOGGLE_TODO = "TOGGLE_TODO";
const SET_FILTER = "SET_FILTER";

// Action Creators
const addTodo: ActionCreator<string> = (text) => ({
  type: ADD_TODO,
  payload: text,
});

const toggleTodo: ActionCreator<number> = (id) => ({
  type: TOGGLE_TODO,
  payload: id,
});

// @ts-ignore
const setFilter = (filter) => ({
  type: SET_FILTER,
  payload: filter,
});

const initialState: TodoState = {
  todos: [],
  filter: "all",
};

const todoReducer: Reducer<TodoState> = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TODO:
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: Date.now(),
            text: action.payload,
            completed: false,
          },
        ],
      };
    case TOGGLE_TODO:
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };
    case SET_FILTER:
      return {
        ...state,
        filter: action.payload,
      };
    default:
      return state;
  }
};

// Selectors
const selectTodos = (state: TodoState) => state.todos;
const selectFilter = (state: TodoState) => state.filter;

const selectFilteredTodos = createSelector(
  selectTodos,
  selectFilter,
  (todos, filter) => {
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }
);

const store = createStore({
  initialState,
  reducers: {
    [ADD_TODO]: todoReducer,
    [TOGGLE_TODO]: todoReducer,
    [SET_FILTER]: todoReducer,
  },
  middleware: [logger, thunk],
});

store.subscribe((state) => {
  console.log("State updated:", state);
  console.log("Filtered todos:", selectFilteredTodos(state));
});

store.dispatch(addTodo("Learn Typescript"));
store.dispatch(addTodo("Learn Typescript"));
store.dispatch(toggleTodo(1));
store.dispatch(setFilter("active"));
