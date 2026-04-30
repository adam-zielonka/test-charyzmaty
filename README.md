# Test Charyzmaty

Aplikacja webowa (React + TypeScript + Vite) do wypełniania kwestionariusza rozeznawania charyzmatow i prezentowania wyniku punktowego dla kazdego charyzmatu.

## Co robi aplikacja

- Wyswietla 115 pytan w jednej stronie.
- Uzywa skali odpowiedzi od 0 do 4:
  - 4: w pelni sie zgadzam
  - 3: raczej sie zgadzam
  - 2: nie jestem zdecydowany
  - 1: raczej sie nie zgadzam
  - 0: zupelnie sie nie zgadzam
- Pokazuje postep uzupelniania (liczba odpowiedzi i procent).
- Liczy punkty dla 23 charyzmatow i wyswietla ranking malejaco.
- Pokazuje pasek postepu dla kazdego charyzmatu (wynik / 20 punktow).
- Dla kazdego charyzmatu udostepnia link do odpowiedniej konferencji wideo.
- Pozwala skopiowac link do aktualnego wyniku oraz wyczyscic wszystkie odpowiedzi.

## Logika wyniku

- Jest 23 charyzmaty i 115 pytan, czyli po 5 pytan na charyzmat.
- Maksymalny wynik jednego charyzmatu to 20 punktow (5 x 4).
- Punkty sa sumowane na podstawie odpowiedzi i przypisania pytan "po kolei":
  - pytanie 1 trafia do 1. charyzmatu,
  - pytanie 2 do 2. charyzmatu,
  - ...,
  - pytanie 24 znowu do 1. charyzmatu itd.

## Link do wyniku

Aplikacja zapisuje odpowiedzi w adresie URL, w parametrze `wynik`.

- Kazda odpowiedz jest kodowana jako jeden znak:
  - `0`, `1`, `2`, `3`, `4` dla zaznaczonej odpowiedzi,
  - `x` dla braku odpowiedzi.
- Dlugosc ciagu musi byc rowna liczbie pytan (115).
- Przy otwarciu takiego linku aplikacja odtwarza zaznaczenia.

Przyklad formatu:

```text
?wynik=4x203... (115 znakow)
```

## Uruchomienie lokalne

Wymagania:

- Node.js 20+ (zalecane)
- pnpm

Instalacja i start:

```bash
pnpm install
pnpm dev
```

Aplikacja bedzie dostepna pod adresem podanym przez Vite (domyslnie `http://localhost:5173`).

## Dostepne skrypty

- `pnpm dev` - uruchamia serwer deweloperski Vite.
- `pnpm build` - kompiluje TypeScript i buduje aplikacje produkcyjna.
- `pnpm preview` - uruchamia podglad zbudowanej aplikacji.
- `pnpm lint` - uruchamia ESLint.

## Stos technologiczny

- React 19
- TypeScript
- Vite 8
- ESLint 10
