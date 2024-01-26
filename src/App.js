import "./App.css";
import FlashcardList from "./FlashcardList";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import axiosRateLimit from "axios-rate-limit";

const axiosWithRateLimit = axiosRateLimit(axios.create(), {
  maxRequests: 10,
  perMilliseconds: 1000,
});

function App() {
  const [flashcards, setFlashCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const categoryEl = useRef();
  const amountEl = useRef();

  useEffect(() => {
    axiosWithRateLimit
      .get("https://opentdb.com/api_category.php")
      .then((res) => {
        setCategories(res.data.trivia_categories);
      });
  }, []);

  function decodeString(str) {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = str;
    return textArea.value;
  }

  function handleSubmit(e) {
    e.preventDefault();
    axiosWithRateLimit
      .get("https://opentdb.com/api.php", {
        params: {
          amount: amountEl.current.value,
          category: categoryEl.current.value,
        },
      })
      .then((res) => {
        setFlashCards(
          res.data.results.map((questionItmes, index) => {
            const answer = decodeString(questionItmes.correct_answer);
            const options = [
              ...questionItmes.incorrect_answers.map((a) => decodeString(a)),
              answer,
            ];
            return {
              id: `${index}-${Date.now()}`,
              question: decodeString(questionItmes.question),
              answer: answer,
              options: options.sort(() => Math.random() - 0.5),
            };
          })
        );
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  return (
    <>
      <div>
        <form
          action=""
          className="header"
          style={{ textAlign: "left" }}
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select name="" id="category" ref={categoryEl}>
              {categories.map((category) => {
                return (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="amount">Number of Questions</label>
            <input
              type="number"
              id="amount"
              min="1"
              step="1"
              defaultValue={10}
              ref={amountEl}
            />
          </div>
          <div className="form-group">
            <button className="btn">Generate</button>
          </div>
        </form>
        <div className="container">
          <FlashcardList flashcards={flashcards} />
        </div>
      </div>
    </>
  );
}
export default App;
