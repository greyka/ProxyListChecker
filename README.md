# ProxyListChecker

[![Release](https://img.shields.io/github/v/release/greyka/ProxyListChecker?include_prereleases)](https://github.com/greyka/ProxyListChecker/releases)
[![Build](https://github.com/greyka/ProxyListChecker/actions/workflows/release.yml/badge.svg)](https://github.com/greyka/ProxyListChecker/actions)

Windows C# / WinForms клиент для **массовой проверки публичных списков прокси** — HTTP / HTTPS / SOCKS4 / SOCKS5. Тянет уже готовые `.txt`-листы с десятков GitHub-репозиториев и API-агрегаторов, прогоняет каждый прокси через реальный HTTP-запрос на тест-URL и сохраняет рабочие с exit IP и латентностью.

> Сосед: [ProxyHabSharp](https://github.com/greyka/ProxyHabSharp) — то же для **VPN-конфигов** (VLESS / VMess / Trojan / SS) через xray-knife.

---

## Возможности

- 📥 **35+ источников по умолчанию** — TheSpeedX, monosans, jetkai, proxyscrape, hideip.me, proxifly, KangProxy, MuRongPIG, fresh-proxy-list и др. Полный список в [`default_sources.txt`](ProxyListChecker/default_sources.txt).
- 🔍 **Кнопка «Найти источники»** — автопоиск свежих прокси-репозиториев через GitHub Search API, добавляет уникальные raw URL в текстбокс.
- ⚡ **Параллельная проверка** до 500 потоков с настраиваемым таймаутом и тест-URL.
- 🎲 **Случайная выборка** — shuffle источников и порядка проверки + лимит N штук за запуск. Каждый запуск даёт разный набор.
- 💾 **Кэш проверок** (`test_cache.json`, TTL 30 мин OK / 10 мин FAIL) — повторные запуски почти мгновенные.
- 🌐 **Натив SOCKS4/SOCKS5** — без дополнительных библиотек (поддержка встроена в .NET 6+).
- 🥷 **Определение anonymity** — сравнивает exit-IP прокси с вашим внешним IP → transparent / anonymous.
- 🎨 **Тема «Матрица»** — для эстетов.
- 🔄 **Self-update** через GitHub Releases.

---

## Установка

### Готовый билд

1. Скачайте zip последнего релиза: [Releases](https://github.com/greyka/ProxyListChecker/releases/latest).
2. Распакуйте куда удобно.
3. Запустите `ProxyListChecker.exe`.

Требуется **.NET 8 Desktop Runtime** (https://dotnet.microsoft.com/download/dotnet/8.0).

### Сборка из исходников

```powershell
git clone https://github.com/greyka/ProxyListChecker.git
cd ProxyListChecker
dotnet build ProxyListChecker/ProxyListChecker.csproj -c Release
.\ProxyListChecker\bin\Release\net8.0-windows\ProxyListChecker.exe
```

---

## Сценарий работы

### 1. Сбор прокси

В левом поле «Источники» — список URL `.txt`-файлов (один на строку, `#` — комментарий).

Кнопка **«1. Собрать»**:
- (опц.) перемешивает порядок URL → разные дубли побеждают каждый раз
- параллельно скачивает все источники
- парсер ([`ProxyParser.cs`](ProxyListChecker/Services/ProxyParser.cs)) понимает любой формат:
  - `host:port`
  - `type://host:port` (`http://`, `https://`, `socks4://`, `socks5://`, `socks4a://`, `socks5h://`)
  - `user:pass@host:port`
  - `type://user:pass@host:port`
  - `host:port:user:pass`
  - `host;port[;user;pass]`
- угадывает тип по имени файла источника (`socks5.txt` → SOCKS5)
- дедупит по полной строке прокси

### 2. Поиск новых источников 🔍

Кнопка **«Найти источники»** → автоматический поиск:

1. Дёргает GitHub Search API (`/search/repositories`) по нескольким запросам:
   - `proxy-list in:name,description sort:updated`
   - `free-proxy in:name,description sort:updated`
   - `socks5 proxy list in:name,description sort:updated`
   - `proxy scraper`, `proxy checker`
2. Берёт топ-30 свежих репо по каждому запросу.
3. Для каждого репо тянет git tree (`/git/trees/HEAD?recursive=1`), ищет файлы вида `(http|https|socks4|socks5|proxy|proxies)*.txt` размером 50 байт – 5 МБ.
4. Собирает raw URL `https://raw.githubusercontent.com/owner/repo/branch/path`.
5. Сравнивает с уже добавленными → пишет только новые в конец текстбокса под разделителем `# --- автопоиск ... ---`.

Лимит — 100 новых за один клик. Если установлен `GITHUB_TOKEN` в env — поднимет rate-limit с 60/час до 5000/час.

### 3. Проверка

Параметры:
- **Потоки** — параллелизм (по умолчанию 100, можно до 500).
- **Таймаут** — мс на запрос (по умолчанию 6000).
- **Тест URL** — куда идёт запрос через прокси. По умолчанию `https://api.ipify.org` (возвращает чистый IP). Можно `https://httpbin.org/ip`, `https://1.1.1.1/cdn-cgi/trace`, или свой эндпоинт.
- **Лимит проверки** — сколько прокси за один запуск (0 = все). Полезно когда листы по 50k.
- **Случайная выборка** — перемешать перед лимитом, чтобы каждый запуск брал разные.
- **Тип фильтра** — All / HTTP / HTTPS / SOCKS4 / SOCKS5.

Под капотом ([`ProxyValidator.cs`](ProxyListChecker/Services/ProxyValidator.cs)):

```csharp
var proxy = new WebProxy("socks5://user:pass@host:port");
var handler = new SocketsHttpHandler { Proxy = proxy, UseProxy = true };
var http = new HttpClient(handler) { Timeout = timeout };
var resp = await http.GetStringAsync(testUrl);   // если URL отдаёт IP — это Exit IP
```

.NET 6+ нативно понимает `socks5://`, `socks4://`, `socks4a://` — никакого собственного хэндшейка городить не надо.

OK условие: HTTP 200 + удалось распарсить body как IPv4 → `Exit IP` заполнен. Если IP отличается от вашего внешнего → `anonymous`, иначе `transparent`.

### 4. Действия с результатом

- **Сохранить рабочие** — `valid_proxies.txt` + раскладка по типам в `by_type/http.txt`, `socks5.txt` и т.д.
- **Копировать в буфер** — список `type://host:port` в clipboard.
- **Удалить нерабочие** — чистит таблицу.

---

## Архитектура

```
ProxyListChecker/
├─ Program.cs              ← точка входа, очистка *.old
├─ MainForm.cs             ← UI (TableLayoutPanel + DataGridView), оркестрация
├─ Models/
│  └─ ProxyEntry.cs        ← ProxyEntry, CheckResult, ProxyKind
├─ Services/
│  ├─ SourceFetcher.cs     ← HTTP GET URL → строки → ProxyParser → dedup
│  ├─ ProxyParser.cs       ← парсит любой популярный формат прокси
│  ├─ ProxyValidator.cs    ← HttpClient через WebProxy(socks5://...) → GET test-url
│  ├─ SourceDiscovery.cs   ← GitHub Search API → git tree → filter → raw URLs
│  ├─ TestCache.cs         ← SHA1 → JSON, TTL по статусу
│  ├─ AppUpdater.cs        ← self-update через github releases
│  └─ Theme.cs             ← Light / Matrix перекраска
├─ default_sources.txt     ← ~120 URL по умолчанию
└─ ProxyListChecker.csproj ← .NET 8 WinForms, PerMonitorV2
```

### Пайплайн проверки

```
[Источники TXT]
      ↓ SourceFetcher (parallel HTTP GET)
[N×строк]
      ↓ ProxyParser.Parse + dedup
[ProxyEntry[]]
      ↓ shuffle + limit (опц.)
      ↓ ProxyValidator (semaphore=N)
[CheckResult] → cache.Put → JSON
      ↓ stream в DataGridView (батчами по 256)
[грид + лог]
```

---

## Источники по умолчанию

~30 GitHub-репозиториев и 12 API-эндпоинтов. См. полный список в [`default_sources.txt`](ProxyListChecker/default_sources.txt). Главные:

| Репо | Что | Обновляется |
|---|---|---|
| [TheSpeedX/PROXY-List](https://github.com/TheSpeedX/PROXY-List) | http/socks4/socks5 | ~ежечасно |
| [monosans/proxy-list](https://github.com/monosans/proxy-list) | + отдельно anonymous | каждые ~10 мин |
| [proxifly/free-proxy-list](https://github.com/proxifly/free-proxy-list) | by-protocol + by-country | каждые 5 мин |
| [jetkai/proxy-list](https://github.com/jetkai/proxy-list) | online-proxies/txt | ~ежечасно |
| [officialputuid/KangProxy](https://github.com/officialputuid/KangProxy) | http / https / socks4 / socks5 | каждые 30 мин |
| [Anonym0usWork1221/Free-Proxies](https://github.com/Anonym0usWork1221/Free-Proxies) | proxy_files/ | ежедневно |
| API [proxyscrape.com](https://proxyscrape.com) v2/v3 | живой эндпоинт | онлайн |
| API [proxy-list.download](https://proxy-list.download) | живой эндпоинт | онлайн |

И ещё ~25 других репозиториев в файле.

---

## Файлы рядом с .exe

| Файл | Назначение |
|---|---|
| `ProxyListChecker.exe` | основной бинарь |
| `default_sources.txt` | стартовый список источников |
| `test_cache.json` | кэш проверок (создаётся автоматически, не коммитится) |
| `*.old` | резерв после self-update (удаляется на следующем старте) |

---

## Self-update

Идентичный механизм с ProxyHabSharp:

1. `GET https://api.github.com/repos/greyka/ProxyListChecker/releases/latest`
2. Сравнивает версию
3. Качает `ProxyListChecker-vX.Y.Z-win-x64.zip`
4. Распаковывает в temp
5. Текущий `.exe` → `.exe.old`, новый поверх
6. Restart

CI на push тега `v*` собирает релиз автоматически.

---

## Версионирование

SemVer:
- `0.X.0` — новая фича
- `0.X.Y` — багфикс / мелочи
- `1.0.0` — feature-complete и стабильно

---

## FAQ

**Q: Откуда такой низкий процент OK?**
A: Публичные прокси-листы — это бесплатный мусор. Из 30k обычно валидны 1-3%. Включайте кэш и shuffle+limit — будете точечно собирать рабочие за несколько запусков.

**Q: Почему мой `socks5://` не работает в браузере?**
A: Проверьте Exit IP в гриде. Если пусто или совпадает с вашим внешним — прокси transparent (не скрывает вас). Если IP другой — всё хорошо, копируйте `socks5://host:port` и используйте.

**Q: GitHub Search возвращает ошибку 403 при поиске источников.**
A: Rate limit (60 req/hour без авторизации). Создайте personal access token и установите в env:
```powershell
$env:GITHUB_TOKEN = "ghp_..."
```
Лимит станет 5000/час.

**Q: Куда сохраняется кэш?**
A: `test_cache.json` рядом с `.exe`. TTL: 30 мин для OK, 10 мин для FAIL. Удалите файл — кэш сбросится.

**Q: Можно проверять авторизованные прокси (`user:pass@host:port`)?**
A: Да, парсер их понимает. HttpClient использует креды через `WebProxy.Credentials`.

---

## Лицензия

MIT. Делайте что хотите.

---

## Связано

- [greyka/ProxyHabSharp](https://github.com/greyka/ProxyHabSharp) — VPN-конфиги (xray-knife) → SOCKS5.
- [TheSpeedX/PROXY-List](https://github.com/TheSpeedX/PROXY-List), [monosans/proxy-list](https://github.com/monosans/proxy-list) — крупнейшие источники.
- [GitHub Search API](https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28) — для автопоиска.
