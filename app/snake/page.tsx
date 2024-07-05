'use client';
import { useEffect } from "react";
import { io } from "socket.io-client";
import "./snake.scss";

export default function Snake() {
  const snakeGridSize = 40;
  const snakeSpeed = 200;
  const snakeInitialLength = 3;
  const snakeInitialPosition = {
    x: Math.floor(snakeGridSize / 2),
    y: Math.floor(snakeGridSize / 2),
  };

  useEffect(() => {
    console.log("Snake page mounted");
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("message", (data) => {
      console.log(data);
    });

    socket.on("joined", (data) => {
      console.log(data);
    });

    socket.on("startGame", (data) => {
      console.log(data);
    });

  }, []);

  useEffect(() => {
    let direction = { x: 1, y: 0 }; // Initial direction: moving right

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          if (direction.y === 0) direction = { x: 0, y: -1 };
          break;
        case "ArrowDown":
          if (direction.y === 0) direction = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
          if (direction.x === 0) direction = { x: -1, y: 0 };
          break;
        case "ArrowRight":
          if (direction.x === 0) direction = { x: 1, y: 0 };
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    // Render snake
    const snake = Array.from({ length: snakeInitialLength }).map((_, i) => ({
      x: snakeInitialPosition.x - i,
      y: snakeInitialPosition.y,
    }));

    // Add the snake class to the cells
    snake.forEach((cell) => {
      const cellElement = document.querySelector(
        `.row:nth-child(${cell.y + 1}) .cell:nth-child(${cell.x + 1})`
      );
      cellElement?.classList.add("snake");
    });

    // Move snake
    const moveSnake = () => {
      const head = snake[0];
      const newHead = { x: head.x + direction.x, y: head.y + direction.y };
      snake.unshift(newHead);

      const tail = snake.pop();
      const tailElement = tail && document.querySelector(
        `.row:nth-child(${tail.y + 1}) .cell:nth-child(${tail.x + 1})`
      );
      tailElement?.classList.remove("snake");

      const newHeadElement = document.querySelector(
        `.row:nth-child(${newHead.y + 1}) .cell:nth-child(${newHead.x + 1})`
      );
      newHeadElement?.classList.add("snake");

      if (newHead.x < 0 || newHead.x >= snakeGridSize || newHead.y < 0 || newHead.y >= snakeGridSize) {
        console.log("Game over");
        return;
      }

      //check if head is on food
      const foodElement = document.querySelector(".food");
      if (foodElement && newHeadElement === foodElement) {
        handleFoodEaten();
      }
    };

    const handleFoodEaten = () => {
      const tail = snake[snake.length - 1];
      snake.push({ x: tail.x, y: tail.y });

      const tailElement = document.querySelector(
        `.row:nth-child(${tail.y + 1}) .cell:nth-child(${tail.x + 1})`
      );

      tailElement?.classList.add("snake");
      
      const foodElement = document.querySelector(".food");
      foodElement?.classList.remove("food");
      createNewFood();
    };

    const interval = setInterval(moveSnake, snakeSpeed);

    return () => {
      clearInterval(interval);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const createNewFood = () => {
    const food = {
      x: Math.floor(Math.random() * snakeGridSize),
      y: Math.floor(Math.random() * snakeGridSize),
    };

    const foodElement = document.querySelector(
      `.row:nth-child(${food.y + 1}) .cell:nth-child(${food.x + 1})`
    );
    foodElement?.classList.add("food");
  }

  useEffect(() => {
    createNewFood();
  }, []);

  return (
    <div className="snake-grid-wrapper">
      <div className="grid">
        {Array.from({ length: snakeGridSize }).map((_, i) => (
          <div key={i} className="row">
            {Array.from({ length: snakeGridSize }).map((_, j) => (
              <div key={j} className="cell"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
