import { Icon } from "@iconify/react/dist/iconify.js";
import "./App.css";
import React, { useEffect, useRef, useState } from "react";

interface Todo {
  id: number;
  title: string;
  todo: string;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todo, setTodo] = useState<Todo>();
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const [open, setOpen] = useState(false);
  const [todoId, setTodoId] = useState<number>();

  const getAllTodos = async () => {
    setLoading(true);
    try {
      const todoItems = await fetch("http://localhost:8081/todos").then(
        (response) => response.json()
      );
      console.log(todoItems);
      setTodos(todoItems as Todo[]);
    } catch (e: any) {
      console.log(e);
      alert("Sorry an error occured can you try again");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllTodos();
  }, []);

  const handleTodoTitle = (title: string) => {
    setTodo({ ...todo, title: title } as Todo);
  };

  const handleTodoDesc = (desc: string) => {
    setTodo({ ...todo, todo: desc } as Todo);
  };

  const postMethod = async (url: string, method: string) => {
    if (!todo?.title) {
      titleRef.current?.focus();
    } else if (!todo.todo) {
      descRef.current?.focus();
    } else {
      setBtnLoading(true);
      try {
        await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(todo),
        });
        if (method == "POST") {
          setTodos([...todos, todo] as Todo[]);
        }
        setTodo({ title: "", todo: "" } as Todo);
      } catch (e: any) {
        console.log(e);
        alert("Sorry failed to add the new todo try again please");
      } finally {
        setBtnLoading(false);
      }
    }
  };

  const createTodo = async () => {
    await postMethod("http://localhost:8081/create_todo", "POST");
  };

  const updateTodo = async () => {
    await postMethod("http://localhost:8081/update_todo", "PUT");
    const newTodo: Todo[] = [];
    todos.map((item) => {
      if (item.id == todo?.id) {
        newTodo.push(todo);
      } else {
        newTodo.push(item);
      }
    });
    setTodos(newTodo);
  };

  const deleteTodo = async () => {
    setModalLoading(true);
    try {
      await fetch("http://localhost:8081/delete_todo/" + todoId, {
        method: "DELETE",
        headers: {
          "content-Type": "application/json",
        },
      });
      setTodo({ title: "", todo: "" } as Todo);
      const newArr : Todo[] = todos.filter(item => item.id != todoId)
      setTodos(newArr)
      setOpen(false)
    } catch (e: any) {
      console.log(e);
      alert("An error occured when deleting the todo");
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="font-bold text-xl w-full h-full justify-center items-center">
        Loading ...
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen  items-center p-2 border-2 border-black gap-2 pt-7">
      <input
        ref={titleRef}
        className="w-[400px] p-2 rounded-md border-2 border-slate-200"
        placeholder="Title"
        value={todo?.title}
        onChange={(e) => handleTodoTitle(e.target.value)}
      />
      <textarea
        ref={descRef}
        className="w-[400px] h-[200px] leading-5 p-2 rounded-md border-2 border-slate-200"
        placeholder="Description"
        value={todo?.todo}
        onChange={(e) => handleTodoDesc(e.target.value)}
      ></textarea>
      <button
        className="w-[400px] p-2 bg-blue-500 rounded-md text-white font-bold"
        onClick={() => {
          if (!btnLoading) {
            if (isUpdate) {
              updateTodo();
            } else {
              createTodo();
            }
          }
        }}
      >
        {btnLoading ? (
          <p>loading ...</p>
        ) : (
          <>{isUpdate ? <p>Update</p> : <p>Submit</p>}</>
        )}
      </button>

      <div className="w-[700px] h-full flex flex-col gap-3 scroll-auto overflow-y-scroll rounded-md">
        {todos.length == 0 ? (
          <div className="flex flex-col items-center">
            <p className="text-center text-xl font-bold mt-10">
              No Todo Present
            </p>
            <Icon
              icon="emojione-v1:empty-note-page"
              width={130}
              height={130}
              className="mt-5"
            />
          </div>
        ) : (
          <>
            {todos.map((item) => (
              <TodoDisplay
                key={item.id}
                todo={item}
                onClick={() => {
                  console.log(item);
                  setTodo(item);
                  setIsUpdate(true);
                }}
                deleteTodo={() => {
                  setTodoId(item.id)
                  setOpen(true)
                }}
              />
            ))}
          </>
        )}
      </div>
      {open && (
        <ConfermModal action={deleteTodo} cancel={() => setOpen(false)} loading = {modalLoading} />
      )}
    </div>
  );
}

const TodoDisplay = React.memo(
  ({
    todo,
    deleteTodo,
    onClick,
  }: {
    todo: Todo;
    onClick: () => void;
    deleteTodo: () => void;
  }) => {
    return (
      <div
        onClick={onClick}
        className="p-4 border-2 border-slate-100 shadow-md rounded-md"
      >
        <div className="flex justify-between">
          <p className="font-bold text-lg items-center">{todo.title}</p>
          <Icon
            icon="streamline:delete-1-solid"
            width={12}
            height={12}
            className="text-slate-400 hover:text-black"
            onClick={deleteTodo}
          />
        </div>
        <p>{todo.todo}</p>
      </div>
    );
  }
);

const ConfermModal = ({
  cancel,
  action,
  loading,
}: {
  cancel: () => void;
  action: () => void;
  loading: boolean;
}) => {
  return (
    <div
      className="fixed flex top-0 w-full h-screen bg-black bg-opacity-20 justify-center items-center"
      onClick={(event) => {
        event.stopPropagation();
        cancel();
      }}
    >
      <div
        className="p-3 border-2 shadow-md rounded-md w-[400px] bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        {loading && (
          <p className="text-md font-bold text-center my-5">Loading ...</p>
        )}
        {!loading && (
          <>
            <p className="text-md font-bold text-center my-5">
              Are you sure you want to delete the Todo
            </p>
            <div className="flex justify-between mb-5">
              <button
                onClick={cancel}
                className="p-2 bg-red-500 rounded-lg w-20 text-white font-bold hover:bg-red-400"
              >
                No
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  action()
                }}
                className="p-2 bg-blue-500 rounded-lg w-20 text-white font-bold hover:bg-blue-400"
              >
                Yes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
