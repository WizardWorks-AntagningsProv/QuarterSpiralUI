# React Grid Color App

Detta projekt är ett frontendgränssnitt byggt i **React** där användaren kan generera färgade kvadrater i ett rutnät. Varje kvadrat får en slumpmässig färg (olika från föregående), och klick på en knapp lägger till en ny kvadrat i spiralordning. Alla ändringar sparas till ett backend-API byggt i **.NET**.

## Funktioner

- Genererar ett rutnät av färgade kvadrater.
- Kvadrater placeras i spiralform runt mitten.
- Varje ny kvadrat får en slumpmässig färg, inte samma som föregående.
- Rutnätet kan återställas med en knapp.
- Rutnätets tillstånd sparas till och hämtas från ett .NET API.

## API

Frontend-appen kommunicerar med ett API på följande endpoint: http://localhost:7049/api/grid

### API-endpoints

- `GET /api/grid` – Hämtar sparat rutnät (tvådimensionell array med färger eller null).
- `POST /api/grid` – Skickar ett uppdaterat rutnät till servern.

### Filöversikt

- `App.jsx` – Hanterar rutnätslogik, färggenerering, klickhändelser och API-anrop.
- `App.css` – Ansvarar för layout, grid och knappdesign.

### Möjlig vidareutveckling

- Lägg till animationer när rutnätet uppdateras.
- Låt användaren välja färgpalett.
- Spara flera rutnät per användare med sessions eller inloggning.
