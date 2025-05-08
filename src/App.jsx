import { useState, useEffect } from "react"; // Importerar React-hooks för statehantering och sidladdningslogik
import "./App.css"; // CSS-styling för layout och grid

// 🎨 Lista med färger som används för att färgsätta rutor
const COLORS = [
  "#e74c3c",
  "#9b59b6",
  "#f1c40f",
  "#2ecc71",
  "#3498db",
  "#e67e22",
  "#1abc9c",
  "#ff69b4",
];

// 🌀 Funktion som genererar kvartsvis lager-expansion kring rutnätet
// Varje lager fylls i ordning: höger ➡ nedåt ⬇ vänster ⬅ (ej upp)
// 🧱 Exempel: Så här växer griden steg för steg:
// Steg 1:
// 1
//
// Steg 2:
// 1 1
// 0 1
//
// Steg 3:
// 1 1
// 1 1
//
// Steg 4:
// 1 1 1
// 1 1 0
// 0 0 0
//
// Steg 5:
// 1 1 1
// 1 1 1
// 0 0 1
//
// Steg 6:
// 1 1 1
// 1 1 1
// 0 1 1
//
// Steg 7:
// 1 1 1
// 1 1 1
// 1 1 1

function generateQuarterSpiral(n) {
  const order = []; // En array som samlar alla koordinater i spiralordning
  let layer = 0; // Varje lager motsvarar ett "varv" i spiralen

  while (layer < n) {
    const end = n - layer - 1; // Slutindex för nuvarande lager

    // Gå från vänster till höger (översta raden i lagret)
    for (let col = layer; col <= end; col++) order.push([layer, col]);

    // Gå uppifrån och ned (högra kolumnen)
    for (let row = layer + 1; row <= end; row++) order.push([row, end]);

    // Gå från höger till vänster (nedersta raden)
    for (let col = end - 1; col >= layer; col--) order.push([end, col]);

    layer++; // Flytta in ett lager
  }

  return order; // Returnerar alla koordinater som ska fyllas
}

function App() {
  const [gridData, setGridData] = useState([]); // En array som innehåller objekt av typen { row, col, color }
  const [gridSize, setGridSize] = useState(1); // Aktuell storlek på griden. Används för att rendera rader/kolumner

  const apiUrl = "https://localhost:7049/api/grid"; // Länk till backend-API för att spara/hämta grid-data

  // 🔁 Returnerar en slumpmässig färg som inte är samma som den tidigare
  const getNextColor = (prev) => {
    let next;
    do {
      next = COLORS[Math.floor(Math.random() * COLORS.length)];
    } while (next === prev); // Se till att inte få två likadana färger efter varandra
    return next;
  };

  // 💾 Funktion som skickar det aktuella rutnätet till API:et (backend)
  const saveGridToApi = async (grid) => {
    try {
      await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(grid), // Konverterar gridData (array av objekt) till JSON-sträng
      });
    } catch (err) {
      console.error("❌ Kunde inte spara till API:", err);
    }
  };

  // 🟢 Hämtar det sparade rutnätet från API när appen laddas
  const loadGridFromApi = async () => {
    try {
      const res = await fetch(apiUrl); // Gör GET-anrop till backend
      if (!res.ok) return;

      const data = await res.json(); // Avkoda JSON-svaret till array
      if (!Array.isArray(data)) return;

      setGridData(data); // Spara hela arrayen med rutor i React-state

      // Hitta största rad/kolumn och sätt storlek +1 för att täcka alla rutor
      const maxRow = Math.max(0, ...data.map((d) => d.row));
      const maxCol = Math.max(0, ...data.map((d) => d.col));
      setGridSize(Math.max(maxRow, maxCol) + 1);
    } catch (err) {
      console.warn("⚠️ Kunde inte läsa rutnät:", err);
    }
  };

  useEffect(() => {
    loadGridFromApi(); // Körs automatiskt när komponenten mountas (sidladdning)
  }, []);

  // ➕ Lägger till en ny ruta på nästa lediga position, sparar till backend och uppdaterar frontend
  const MICROSOFT_COLORS = ["#F25022", "#7FBA00", "#FFB900", "#00A4EF"];

  const addSquare = async () => {
    const filled = new Set(gridData.map((d) => `${d.row},${d.col}`));
    const fillOrder = generateQuarterSpiral(gridSize);
    const next = fillOrder.find(([r, c]) => !filled.has(`${r},${c}`));

    let newData;

    if (next) {
      const [row, col] = next;
      const index = gridData.length;

      // De fyra första färgerna sätts manuellt
      const color =
        index < MICROSOFT_COLORS.length
          ? MICROSOFT_COLORS[index]
          : getNextColor(gridData.at(-1)?.color);

      newData = [...gridData, { row, col, color }];
    } else {
      const newSize = gridSize + 1;
      const newOrder = generateQuarterSpiral(newSize);
      const alreadyFilled = new Set(gridData.map((d) => `${d.row},${d.col}`));
      const firstNew = newOrder.find(
        ([r, c]) => !alreadyFilled.has(`${r},${c}`)
      );

      if (!firstNew) return;

      const [row, col] = firstNew;
      const index = gridData.length;
      const color =
        index < MICROSOFT_COLORS.length
          ? MICROSOFT_COLORS[index]
          : getNextColor(gridData.at(-1)?.color);

      newData = [...gridData, { row, col, color }];
      setGridSize(newSize);
    }

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      if (!res.ok) throw new Error("API svarade inte OK");

      setGridData(newData);
    } catch (err) {
      console.error("❌ Kunde inte spara ny ruta till API:", err.message);
      alert("Kunde inte spara till servern. Försök igen.");
    }
  };

  // 🗑️ Tömmer rutnätet helt
  const clearGrid = () => {
    setGridData([]); // Töm rutor i state
    setGridSize(1); // Sätt tillbaka till ursprungsstorlek
    saveGridToApi([]); // Spara tom grid till backend
  };

  return (
    <div className="container">
      {" "}
      {/* Wrapper-element för allt innehåll */}
      <div className="controls">
        {" "}
        {/* Sektion för knappar */}
        <button className="add" onClick={addSquare}>
          {" "}
          {/* Lägg till ny ruta */}
          Add square
        </button>
        <button className="clear" onClick={clearGrid}>
          {" "}
          {/* Töm hela rutnätet */}
          Clear
        </button>
      </div>
      <div className="grid">
        {" "}
        {/* Rityta för rutnätet */}
        {Array.from({ length: gridSize }).map((_, rowIndex) => (
          <div className="row" key={rowIndex}>
            {" "}
            {/* Renderar en rad */}
            {Array.from({ length: gridSize }).map((_, colIndex) => {
              const square = gridData.find(
                (s) => s.row === rowIndex && s.col === colIndex
              ); // Hittar ruta som matchar denna cell-position
              return (
                <div
                  key={colIndex}
                  className="cell"
                  style={{
                    backgroundColor: square?.color || "transparent", // Bakgrundsfärg
                    border: square
                      ? "1px solid black"
                      : "1px dashed transparent", // Synlig kantlinje om rutan finns
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App; // Exporterar huvudkomponenten
