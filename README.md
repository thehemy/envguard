# 🛡 envguard

Zero-dependency CLI that checks your `.env` against `.env.example` — catches missing keys and empty values before the app crashes in production. Use it locally, in a pre-commit hook or in CI.

Маленькая утилита без зависимостей: сверяет `.env` с `.env.example` и находит пропущенные и пустые переменные.

## Usage
```bash
npx envguard                      # .env vs .env.example
npx envguard -f .env.production   # другой файл
npx envguard --strict             # ещё и ругаться на лишние ключи
```
```
Missing keys:
  - DATABASE_URL
Empty values:
  ! API_KEY
✖ .env has problems
```
Exit codes: `0` ok · `1` problems · `2` file not found.

## CI example
```yaml
- run: npx envguard -e .env.example -f .env.ci
```

## API
```js
import { parseEnv, compareEnv } from "envguard";
const { missing, empty, extra, ok } = compareEnv(parseEnv(a), parseEnv(b));
```

## Develop
`npm test` (Node ≥ 18, uses the built-in test runner).

## License
MIT
