'use client';
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./snake.scss";

export default function Snake() {
  const snakeInitialLength = 3;
  const snakeGridSize = 40;
  const snakeSpeed = 100;
  const snakeInitialPosition = {
    x: Math.floor(snakeGridSize / 2),
    y: Math.floor(snakeGridSize / 2),
  };

  const [socket, setSocket] = useState(io("http://localhost:3000"));
  const [snake, setSnake] = useState<{
    x: number;
    y: number;
  }[]>(Array.from({ length: snakeInitialLength }).map((_, i) => ({
    x: snakeInitialPosition.x - i,
    y: snakeInitialPosition.y,
  })));

  useEffect(() => {
    console.log("Snake page mounted");
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.emit("join-room", "snake");

    socket.on("joined", (data) => {
      console.log(data);
    });

    socket.on("startGame", (data) => {
      console.log(data);
    });

    socket.on("snake-position", (data) => {
      const cells = document.querySelectorAll(".opponent");
      cells.forEach((cell) => cell.classList.remove("opponent"));

      data.forEach((cell) => {
        const cellElement = document.querySelector(
          `.row:nth-child(${cell.y + 1}) .cell:nth-child(${cell.x + 1})`
        );
        cellElement?.classList.add("opponent");
      });
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

      socket.emit("change-direction", direction);
    };

    document.addEventListener("keydown", handleKeyPress);

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

      socket.emit("snake-position", snake);
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

      <button onClick={() => socket.emit("kill-rooms")}>Kill rooms</button>
    </div>
  );
}
