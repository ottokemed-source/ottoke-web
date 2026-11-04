Kod strony Ottoke w Astro. Start: `npm run dev` w tym katalogu (z projektu:
`npm run dev --prefix 03_STRONA`). Tokeny: `src\styles\tokens.css`.

## Treść i konsola

Treść leży w `src\content\*.json`: jeden plik na norigae, horquillę i wydarzenie,
osobne pliki na dane sklepu, produkty, kimchi, FAQ i Nosotras. Edytują je klientki
w Pages CMS (konfiguracja `.pages.yml`). `src\data\*.js` czyta te pliki i sprawdza
je przy buildzie: zła wartość zatrzymuje build, a strona zostaje w ostatniej dobrej
wersji.

Obieg:
1. Klientka zapisuje w Pages CMS na gałęzi `borrador`.
2. Workflow `recortar.yml` wycina tło z nowego zdjęcia (`tools\procesar_fotos.py`,
   `tools\wytnij_tlo.py`) i robi obrazek do udostępniania. Nowy norigae pojawia się
   na stronie dopiero z wycięciem.
3. Cloudflare Pages buduje `borrador` pod adresem podglądu, np.
   `borrador.<projekt>.pages.dev`.
4. Przycisk "Publicar en la página" w Pages CMS uruchamia `publicar.yml`: `borrador`
   idzie do `main`, Cloudflare buduje stronę główną.

## Uruchomienie (robi Maks, raz)

1. Konto GitHub i Cloudflare na e-mail Ottoke; Maks jako współpracownik.
2. Nowe repo tylko z zawartością tego katalogu (bez dokumentów klientek z
   repo projektu). Repo może być publiczne: wtedy Actions są bez limitu.
3. Gałąź `borrador` z `main`.
4. Cloudflare Pages podpięte do repo: build `npm run build`, wynik `dist`,
   gałąź produkcyjna `main`, podglądy włączone dla `borrador`. Powiadomienie
   o nieudanym buildzie na e-mail.
5. Pages CMS: zalogować się na app.pagescms.org, zainstalować aplikację tylko na
   tym repo, otworzyć gałąź `borrador`, zaprosić e-mailem Ivonne i Anę Maríę.
6. Test na ich telefonach i komputerze: przełączyć "Disponible", dodać norigae
   ze zdjęciem, opublikować.
7. Przed publikacją dla Google: `published = true` w `src\layouts\Base.astro`,
   usunąć `src\pages\eventos\sin-fecha.astro` i otwarcie, którego nie wybrały.

Do sprawdzenia w pilocie: czy pole daty zapisuje `2026-12-19T15:00`, czy przycisk
"Publicar" startuje workflow na `borrador`, czy dwie osoby naraz nie nadpisują
sobie tego samego pliku.
