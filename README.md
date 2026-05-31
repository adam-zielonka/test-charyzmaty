# Test Charyzmaty

Aplikacja webowa (React + TypeScript + Vite) do rozeznawania charyzmatow. Zawiera test kwestionariuszowy, widok planu formacji oraz karte do wydruku/PDF do rozeznawania charyzmatow we wspolnocie.

## Co robi aplikacja

- Wyswietla 115 pytan w jednej stronie.
- Uzywa skali odpowiedzi od 0 do 4:
  - 4: w pelni sie zgadzam
  - 3: raczej sie zgadzam
  - 2: nie jestem zdecydowany
  - 1: raczej sie nie zgadzam
  - 0: zupelnie sie nie zgadzam
- Pokazuje uwagi wstepne i opis skali przed rozpoczeciem testu.
- Pokazuje postep uzupelniania (liczba odpowiedzi i procent).
- Liczy punkty dla 23 charyzmatow i wyswietla ranking malejaco.
- Pokazuje pasek postepu dla kazdego charyzmatu (wynik / 20 punktow).
- Dla kazdego charyzmatu udostepnia link do odpowiedniej konferencji wideo.
- Pozwala skopiowac link do aktualnego wyniku oraz wyczyscic wszystkie odpowiedzi.
- Zapisuje odpowiedzi lokalnie w pamieci przegladarki, zeby pozostawaly dostepne po odswiezeniu strony.
- Udostepnia dodatkowy widok planu formacji oparty o playliste z pliku `public/rozpiska/playlist.json`.
- Udostepnia dodatkowy widok karty do wydruku/PDF z opisami charyzmatow na podstawie pliku `opisy.txt`.

## Widoki aplikacji

Aplikacja obsluguje trzy widoki:

- `test` - glowny widok kwestionariusza i wyniku.
- `rozpiska` - plan formacji i lista materialow do przejscia krok po kroku.
- `karta` - karta do wydruku/PDF do rozeznawania charyzmatow u danej osoby.

Widok jest wybierany przez parametr URL `widok`:

```text
?widok=rozpiska
?widok=karta
```

## Logika wyniku

- Jest 23 charyzmaty i 115 pytan, czyli po 5 pytan na charyzmat.
- Maksymalny wynik jednego charyzmatu to 20 punktow (5 x 4).
- Punkty sa sumowane na podstawie odpowiedzi i przypisania pytan "po kolei":
  - pytanie 1 trafia do 1. charyzmatu,
  - pytanie 2 do 2. charyzmatu,
  - ...,
  - pytanie 24 znowu do 1. charyzmatu itd.

## Link do wyniku i zapis odpowiedzi

Aplikacja zapisuje odpowiedzi w adresie URL, w parametrze `wynik`, oraz lokalnie w `localStorage` przegladarki.

- Kazda odpowiedz jest kodowana jako jeden znak:
  - `0`, `1`, `2`, `3`, `4` dla zaznaczonej odpowiedzi,
  - `x` dla braku odpowiedzi.
- Dlugosc ciagu musi byc rowna liczbie pytan (115).
- Przy otwarciu takiego linku aplikacja odtwarza zaznaczenia i pokazuje wynik w trybie podgladu.
- Samo otwarcie linku nie nadpisuje odpowiedzi zapisanych lokalnie na danym urzadzeniu.
- Dopiero wybranie opcji modyfikacji pytan zapisuje odpowiedzi z linku jako lokalna wersje uzytkownika.

Przyklad formatu:

```text
?wynik=4x203... (115 znakow)
```

Jesli uzytkownik otwiera aplikacje bez parametru `wynik`, zostana wczytane odpowiedzi zapisane lokalnie w przegladarce.

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
- Sass
