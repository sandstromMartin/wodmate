# WODmate

En svensk CrossFit-app för att skapa, spara och dela träningspass. Byggd med React, TypeScript och Vite.

## Vad som fungerar i prototypen

- Responsiv startsida med svensk UI och engelska träningsbegrepp.
- Generera ett exempelpass utifrån val: fokus, träningsform, tid, utrustning och nivå.
- Fritextfält för vad du är sugen på.
- Redigera passnamn och anteckningar.
- Spara pass lokalt i webbläsaren.
- Favoritmarkera, söka och filtrera pass.
- Skapa egna pass manuellt.
- Exportera ett pass som JSON och importera JSON-pass.
- Skapa en delningslänk som innehåller passdata i URL:ens hash.

## Viktigt om AI och delning

Den här första prototypen använder en lokal regelbaserad generator — **den anropar inte en AI-tjänst ännu**. Den är till för att göra gränssnittet och grundflödet testbart utan API-nycklar.

Delningslänken kodar passet i URL:en. Det kräver ingen server, men länken kan bli lång och det är inte en ersättning för ett privat konto eller behörighetssystem. För korta länkar, molnlagring och delade bibliotek behöver vi lägga till en backend, exempelvis Supabase.

AI-integration ska göras via en server-/edge-funktion. Lägg aldrig en hemlig AI-API-nyckel i frontendkoden.

## Köra lokalt

Kräver Node.js 20 eller senare.

```bash
npm install
npm run dev
```

Öppna adressen som Vite visar i terminalen.

Kontrollera produktionsbygget:

```bash
npm run build
npm run preview
```

## Lägga upp på GitHub

1. Skapa ett tomt repository på GitHub.
2. Packa upp ZIP-filen.
3. Ladda upp filerna till repot (eller kör `git init`, `git add .`, `git commit` och `git push` från en dator).
4. För att köra appen behöver projektet byggas med Node.js. GitHub lagrar koden, men kör inte utvecklingsservern direkt.

### Publicera med GitHub Pages

Det finns redan en GitHub Actions-workflow i `.github/workflows/deploy.yml`.

1. Lägg upp filerna på GitHub på en branch som heter `main`.
2. Öppna repots **Settings → Pages**.
3. Under **Build and deployment**, välj **GitHub Actions** som källa.
4. När workflowen har körts klart hittar du appens länk på samma Pages-sida.

Projektet använder `base: './'` i Vite-konfigurationen för att fungera under ett repo-namn.

## Nästa steg

1. Ersätt regelbaserad generator med AI via en säker backendfunktion.
2. Flytta lagring till IndexedDB eller ett repository-lager och lägg till export/säkerhetskopiering.
3. Lägg till Supabase för korta delningslänkar, molnlagring och senare användarkonton.
4. Lägg till pass-timer, resultat och historik.
5. Lägg till tester och validering av AI-genererade pass.

## Säkerhet och träningsinnehåll

Genererade pass är inspirationsförslag, inte medicinsk rådgivning. Anpassa belastning, teknik och volym efter din nivå och utrustning. Kontrollera alltid ett pass innan du kör det.
