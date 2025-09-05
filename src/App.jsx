import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import "./App.css";

const ThemeContext = createContext();

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("expense-tracker-theme");
    return savedTheme || "dark";
  });

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    localStorage.setItem("expense-tracker-theme", theme);
    document.body.className = theme;
  }, [theme]);

  const value = {
    theme,
    toggleTheme,
    isDark: theme === "dark",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <p className="theme-toggle" onClick={toggleTheme}>
      {theme === "dark" ? "☀️" : "🌙"}
    </p>
  );
}

function ExpenseForm({ dispatch }) {
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({
      type: "ADD_EXPENSE",
      payload: { ...form },
    });
    setForm({
      description: "",
      amount: "",
      category: "",
    });
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <label htmlFor="desc">Description:</label>
        <input
          type="text"
          name="desc"
          value={form.description}
          placeholder="Enter Description..."
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <label htmlFor="amount">Amount:</label>
        <input
          type="number"
          min="0"
          step="0.01"
          name="amount"
          value={form.amount}
          placeholder="Enter Amount..."
          onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
          required
        />
        <label htmlFor="category">Category:</label>
        <input
          type="text"
          name="category"
          value={form.category}
          placeholder="Enter Category..."
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />
        <input type="submit" id="submitBtn" value="Add Expense" />
      </form>
    </div>
  );
}

function ExpenseComponent({ expenses, dispatch }) {
  const { isDark } = useTheme();
  const [editTaskId, setEditTaskId] = useState(-1);
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    category: "",
  });

  const handleSave = (expenseId) => {
    dispatch({ type: "EDIT_EXPENSE", payload: { id: expenseId, ...editForm } });
    setEditForm({
      description: "",
      amount: "",
      category: "",
    });
    setEditTaskId(-1);
  };

  const totalAmount = expenses.reduce(
    (acc, exp) => acc + (Number(exp.amount) ?? 0),
    0
  );

  return (
    <div className="expenses-container">
      {expenses.length === 0 ? (
        <div className="empty-state">
          <p>No expenses added yet. Add your first expense above!</p>
        </div>
      ) : (
        <>
          <ul>
            {expenses.map((exp) => (
              <li key={exp.id}>
                {editTaskId !== exp.id ? (
                  <>
                    <p>{exp.description}</p>
                    <p>Amount: ${exp.amount.toFixed(2)}</p>
                    <p>Category: {exp.category}</p>
                    <div className="expense-actions">
                      <button
                        onClick={() => {
                          setEditTaskId(exp.id);
                          setEditForm({
                            description: exp.description,
                            amount: exp.amount,
                            category: exp.category,
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          dispatch({
                            type: "DELETE_EXPENSE",
                            expenseId: exp.id,
                          })
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSave(exp.id);
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Edit Description..."
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Edit Amount..."
                      value={editForm.amount}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          amount: Number(e.target.value),
                        })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Edit Category..."
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm({ ...editForm, category: e.target.value })
                      }
                      required
                    />
                    <div className="form-actions">
                      <input type="submit" value="Save" />
                      <input
                        type="button"
                        value="Cancel"
                        onClick={() => setEditTaskId(-1)}
                      />
                    </div>
                  </form>
                )}
              </li>
            ))}
          </ul>
          {totalAmount > 0 && (
            <div className="total-container">
              <p>Total: ${totalAmount.toFixed(2)}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD_EXPENSE":
      return [
        ...state,
        {
          id: new Date().getTime(),
          ...action.payload,
          date: new Date().toLocaleString(),
        },
      ];
    case "EDIT_EXPENSE":
      return state.map((exp) =>
        action.payload.id === exp.id ? { ...exp, ...action.payload } : exp
      );
    case "DELETE_EXPENSE":
      return state.filter((exp) => exp.id !== action.expenseId);
    default:
      return state;
  }
}

function App() {
  const [expenses, dispatch] = useReducer(
    reducer,
    (() => {
      try {
        return JSON.parse(localStorage.getItem("ExpensesArray")) ?? [];
      } catch {
        return [];
      }
    })()
  );
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "",
  });

  useEffect(() => {
    localStorage.setItem("ExpensesArray", JSON.stringify(expenses));
  }, [expenses]);

  return (
    <ThemeProvider>
      <h1>Expense Tracker</h1>
      <ThemeToggle />
      <ExpenseForm dispatch={dispatch} />
      <ExpenseComponent expenses={expenses} dispatch={dispatch} />
    </ThemeProvider>
  );
}

export default App;
