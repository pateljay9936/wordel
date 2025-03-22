"use client";
import React, { useState, useEffect, useRef } from "react";

const API_URL = "https://cheaderthecoder.github.io/5-Letter-words/words.json";
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
const WORD_LENGTH = 5;

export default function Home() {
  const [apiContent, setApiContent] = useState([]);
  const [solution, setSolution] = useState("");
  const hasFetched = useRef(false); // Track if fetched already
  const [guessPanel, setGuessPanel] = useState(Array(6).fill(null));
  const [currentGuess, setCurrentGuess] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    const handleType = (event) => {
      if (event.key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }
      if (event.key === "Enter" && currentGuess.length === WORD_LENGTH) {
        const updatedGuessPanel = [...guessPanel];
        const firstNullIndex = updatedGuessPanel.findIndex((guess) => guess === null);

        if (!apiContent.includes(currentGuess)) {
          setColor("red");
          setErrorMessage("Invalid guess");
          setTimeout(() => setErrorMessage(""), 600); // Clear the error after 1 second
          setCurrentGuess("");
          return;
        }

        if (firstNullIndex !== -1) {
          updatedGuessPanel[firstNullIndex] = currentGuess;
          setGuessPanel(updatedGuessPanel);
          setCurrentGuess(""); // Reset current guess after submission

          if (currentGuess === solution) {
            setColor("green");
            setErrorMessage("You won!");
            setTimeout(() => setErrorMessage(""), 600); // Clear the error after 1 second
            window.removeEventListener("keydown", handleType);
          }
        }
        return;
      }

      if (currentGuess.length >= WORD_LENGTH) {
        return;
      }

      if (event.key.match(/^[a-zA-Z]$/i)) {
        setCurrentGuess((prev) => prev + event.key.toLowerCase()); // Append the key to the current guess
      }
    };

    if (guessPanel[5] === null) {
      window.addEventListener("keydown", handleType);
    }

    return () => {
      window.removeEventListener("keydown", handleType);
    };
  }, [currentGuess, guessPanel, apiContent, solution]);

  useEffect(() => {
    if (hasFetched.current) return; // Prevent duplicate calls
    hasFetched.current = true;

    const contentFetch = async () => {
      try {
        const data = await fetch(PROXY_URL + API_URL);
        if (!data.ok) {
          throw new Error(`HTTP error! status: ${data.status}`);
        }
        const array = await data.json();
        const response = array.words;
        setApiContent(response);

        const randomWord = response[Math.floor(Math.random() * response.length)];
        setSolution(randomWord);
        console.log("Solution:", randomWord); // Logs a random word from the array
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    contentFetch();
  }, []);

  return (
    <div className="App max-h-screen max-w-screen bg-gray-800">
      <header className="App-header py-4">
        <h1 className="font-black my-4 text-white">Wordle</h1>

        <div className="wordle my-4">
          {guessPanel.map((guess, index) => (
            <div key={index} className="flex justify-center items-center">
              <Line guess={guess ?? " "} solution={solution} />
            </div>
          ))}

          <div className="min-h-10 text-white">
            {currentGuess || <span>&nbsp;</span>}
          </div>

          {/* Display error message */}
          {errorMessage && (
            <div
              className={`bg-red-500 text-white p-2 rounded mb-4 ${
                errorMessage === "You won!" ? "bg-green-500" : ""
              }`}
            >
              {errorMessage}
            </div>
          )}
        </div>

        {/* Instructions Section */}
        <div className="text-sm text-white p-4 mt-4">
          <h3 className="text-lg font-bold mb-2">How to Play</h3>
          <ul className="list-disc list-inside">
            <li>Guess the 5-letter word in 6 tries.</li>
            <li>Each guess must be a valid 5-letter word.</li>
            <li>
              After each guess, the color of the tiles will change to show how
              close your guess was to the word:
            </li>
            <ul className="list-disc list-inside ml-4">
              <li>
                <span className="text-green-500 font-bold">Green</span>: Correct
                letter in the correct position.
              </li>
              <li>
                <span className="text-yellow-500 font-bold">Yellow</span>: Correct
                letter in the wrong position.
              </li>
              <li>
                <span className=" font-bold">Bg color</span>: Incorrect
                letter.
              </li>
            </ul>
                        <li>Press {"Enter"} to submit your guess.</li>
            <li>Use {"Backspace"} to delete a letter.</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

function Line({ guess, solution }) {
  const Tiles = [];

  for (let i = 0; i < WORD_LENGTH; i++) {
    const char = guess[i];
    let tileClass =
      "h-10 w-10 border-white border m-1 flex justify-center items-center";

    // Change color based on condition
    if (char === solution[i]) {
      tileClass += " bg-green-500"; // Correct letter in the correct position
    } else if (solution.includes(char)) {
      tileClass += " bg-yellow-500"; // Correct letter in the wrong position
    }

    Tiles.push(
      <div key={i} className={tileClass}>
        {char}
      </div>
    );
  }

  return <>{Tiles}</>;
}